import DRIVERS from '../consts/drivers.js';
import Base from "../base.js";
import {Pool} from 'pg'
import EVENTS from "../consts/events.js";
import QueryResult from "../query-result.js";
import Command from "./command.js";
import * as helper from "../helper.js";

/**
 * @typedef ConfigPostgres
 * @property {string} applicationName
 * @property {string} host
 * @property {number} port
 * @property {string} database
 * @property {string} username
 * @property {string} password
 * @property {string} ssl
 * @property {number} poolSize
 * @property {number} idleTimeoutMillis
 * @property {number} connectTimeoutMS
 *
 * @property {ConfigPostgres[]} slaves
 */


export default class PostgresDialect extends Base {

	config = null;
	isReplicated = false;
	master = undefined;
	slaves = [];

	/**
	 * @return {string}
	 */
	getDriverName() {
		return DRIVERS.POSTGRES;
	}

	/**
	 * @param {ConfigPostgres} config
	 */
	constructor(config) {
		super(config);
		if (!config) {
			return;
		}
		this.config = config;
		this.isReplicated = config.slaves && config.slaves.length;
	}

	get tablePrefix() {
		return this.config.tablePrefix ?? '';
	}

	/**
	 * Connect to master or slave+master
	 * @returns {Promise<void>}
	 */
	async connect() {
		if (this.master) {
			return;
		}
		if (this.isReplicated) {
			for (const config of this.config.slaves) {
				this.slaves.push(
					await this.createPool(config),
				);
			}
			this.master = await this.createPool(this.config.master);
		} else {
			this.master = await this.createPool(this.config);
		}
	}

	/**
	 * Disconnect for current master or slave+master
	 * @returns {Promise<void>}
	 */
	async disconnect() {
		if (this.master) {
			await this.closePool(this.master);
			this.master = undefined;
		}
		if (this.slaves.length) {
			await Promise.all(this.slaves.map((slave) => this.closePool(slave)));
			this.slaves = [];
		}
	}

	/**
	 * Close pool connection
	 * @param pool
	 * @returns {Promise<*>}
	 */
	async closePool(pool) {
		if (!pool) {
			return;
		}
		return await pool.end();
	}

	/**
	 * Create Pool on master or slaves+master
	 * @param {ConfigPostgres|{}} options
	 * @returns {Promise<void>}
	 */
	async createPool(options) {

		const config = {
			application_name: options.applicationName ?? 'node-dba-client',
			host: options.host ?? 'localhost',
			database: options.database,
			user: options.username,
			password: options.password,
			port: options.port,
			ssl: options.ssl ?? void 0,
			idleTimeoutMillis: options.idleTimeoutMillis ?? 30000,
			connectionTimeoutMillis: options.connectTimeoutMS ?? 2000,
			max: options.poolSize ?? 500,
		};

		const pool = new Pool(config);

		pool.on('connect', (client) => {
			this.emit(EVENTS.CONNECT, {client});
		});

		pool.on('error', (err, client) => {
			this.emit(EVENTS.ERROR, {err, client});
		});

		try {
			await pool.query('SELECT version();');
			return pool;
		} catch (err) {
			this.emit(EVENTS.ERROR, { err });
			await pool.end().catch(() => {});
			throw err;
		}
	}

	createQueryResult(sql, raw) {
		const result = new QueryResult();
		result.sql = String(sql);
		if (raw) {
			result.raw = raw;
			if (raw.hasOwnProperty('rows')) {
				result.rows = raw.rows;
			}
			if (raw.hasOwnProperty('rowCount')) {
				result.rowCount = raw.rowCount;
			}
		}
		return result;
	}

	async getPool(sql) { // Переименовано в getPool для исключения путаницы с клиентом
		await this.connect();
		const isSelect = sql && /^select/i.test(sql.trim());

		if (isSelect && this.isReplicated && this.slaves.length > 0) {
			const index = Math.floor(Math.random() * this.slaves.length);
			return this.slaves[index];
		}
		return this.master;
	}


	/**
	 * @param {string} sql
	 * @param params
	 * @returns {Promise<QueryResult>}
	 */
	async execute(sql, params = []) {
		const pool = await this.getPool(sql);

		this.emit(EVENTS.QUERY ?? 'query', { sql, params, timestamp: Date.now() });

		try {
			const raw = await pool.query(sql, params);
			return this.createQueryResult(sql, raw);
		} catch (err) {
			this.emit(EVENTS.ERROR, { err, sql, params });
			throw err;
		}
	}

	async transaction(callback) {
		await this.connect();
		const pool = this.master;
		const client = await pool.connect();

		try {
			await client.query('BEGIN');
			this.emit(EVENTS.BEGIN_TRANSACTION);
			const result = await callback(client, this);
			await client.query('COMMIT');
			this.emit(EVENTS.COMMIT_TRANSACTION);
			return result;
		} catch (err) {
			await client.query('ROLLBACK');
			this.emit(EVENTS.ERROR, { err });
			throw err;
		} finally {
			client.release();
		}
	}

	/**
	 *
	 * @param sql {string|null}
	 * @param params
	 * @return {Command}
	 */
	createCommand(sql = null, params = {}) {
		return new Command({
			db: this,
			sql,
			params,
		});
	}

	quoteValue(value) {
		if (typeof value == 'number') {
			return value;
		}
		if (/^\d[\d.]*$/.test(value)) {
			return value;
		}

		return '\'' +
			helper.addcslashes(value.replaceAll('\'', '\'\''), '\\000\n\r\\032') +
			'\'';
	}

}
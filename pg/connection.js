const BaseConnection = require('../connection');
const Schema = require('./schema');
const {Pool, Client} = require('pg');

/**
 * @typedef ConfigPostgres
 * @property {string} host
 * @property {number} port
 * @property {string} database
 * @property {string} username
 * @property {string} password
 * @property {string} ssl
 * @property {number} poolSize
 * @property {number} connectTimeoutMS
 *
 * @property {ConfigPostgres[]} slaves
 */


class PgConnection extends BaseConnection {
  
  /*** @type {Object} lib */
  #master;
  #slaves = [];
  #config = {};
  
  isReplicated = false;
  
  static get getDriverName() {
    return 'pg';
  }
  
  /**
   * @param {ConfigPostgres} config
   */
  constructor(config) {
    super(config);
    if (!config) {
      return;
    }
    this.#config = config;
    this.isReplicated = config.slaves && config.slaves.length;
    
  }
  
  /**
   * Connect to master or slave+master
   * @returns {Promise<void>}
   */
  async connect() {
    
    if (this.#master) {
      return;
    }
  
    if (this.isReplicated) {
      for (const config of this.#config.slaves) {
        this.#slaves.push(
          await this.createPool(config)
        )
      }
    }
    
    this.#master = await this.createPool(this.#config);
  }

  /**
   * Disconnect for current master or slave+master
   * @returns {Promise<void>}
   */
  async disconnect(){
    await this.closePool(this.#master);
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
      host: options.host ?? 'localhost',
      database: options.database,
      user: options.username,
      password: options.password,
      port: options.port,
      ssl: options.ssl ?? void 0,
      connectionTimeoutMillis: options.connectTimeoutMS ?? 2000,
      max: options.poolSize ?? 10
    }
    
    const pool = new Pool(config);
    pool.on('connect', (client) => {
      this.emit(this.EVENTS.CONNECT, {client});
    });
    pool.on('error', (err, client) => {
      this.emit(this.EVENTS.ERROR, {err, client});
    });

    this.#master = pool;

    return new Promise((resolve, reject) => {
      pool.connect( async (err, client, release) => {
        if (err) {
          return reject(err);
        }

        try {
          let result = await pool.query('SELECT version()');
        } catch (err) {
          this.emit(this.EVENTS.ERROR, {err});
        }

        // add attach to events (later)
        
        release();
        resolve(pool);
      })
    })
  }

  /**
   * get Schema component
   * @returns {Schema}
   */
  getSchema() {
    return new Schema({
      db: this
    })
  }

  async execute(sql) {
    await this.connect()
    return this.#master.query('sql');
  }

}

module.exports = PgConnection;

const axios = require('axios');
const BaseConnection = require('../connection');
const {CLICKHOUSE} = require('../consts/drivers');

/**
 * @typedef ConfigClickHouse
 * @property {string} host
 * @property {number} port
 * @property {string} database
 * @property {string} username
 * @property {string} password
 *
 * @property {ConfigPostgres[]} slaves
 */

class ClickHouseConnection extends BaseConnection {
	/**
	 * @param {ConfigClickHouse} config
	 */
	constructor(config) {
		super();

		if (!config) {
			return;
		}
		this.#config = config;
	}

	/**
	 * @return {string}
	 */
	getDriverName() {
		return CLICKHOUSE;
	}

}
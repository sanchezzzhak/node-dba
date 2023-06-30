const Base = require('./base');
const QueryBuilder = require('./query-builder');
const Command = require('./command');
const helper = require('./helper');
const ActiveQuery = require('./active-query');
const fs = require('node:fs');

const EVENTS = {
  AFTER_OPEN: 'afterOpen',
  BEFORE_OPEN: 'beforeOpen',
  CONNECT: 'connect',
  ERROR: 'error',
  BEGIN_TRANSACTION: 'beginTransaction',
  COMMIT_TRANSACTION: 'commitTransaction',
  ROLLBACK_TRANSACTION: 'rollbackTransaction',
};

class BaseConnection extends Base {

  constructor(config) {
    super(config);
    this.setOwnProperties(config);
  }

  tablePrefix = '';

  EVENTS = EVENTS;

  /**
   * get driver name for currently connection
   */
  static get driverName() {
    throw new Error(
        'need implementation driverName() getter for current class');
  }

  /**
   * Returns instance for the currently active master connection.
   * @returns {Promise<void>}
   */
  async connect() {
    throw new Error('need implementation connect() method for current class');
  }

  /**
   * the currently class instance associated with this DB connection.
   * @returns {Promise<void>}
   */
  async disconnect() {
    throw new Error(
        'need implementation disconnect() method for current class');
  }

  /**
   * Quotes a table name for use in a query.
   * @param {string} table - table name
   * @returns {string}
   */
  quoteTableName(table) {
    return this.getSchema().quoteTableName(table);
  }

  /**
   * Quotes a string value for use in a query.
   * @param {string} value - string to be quoted
   * @returns {string}
   */
  quoteValue(value) {
    return this.getSchema().quoteValue(value);
  }

  /**
   * Quotes a column name for use in a query.
   * @param {string} name - column name
   * @returns {string}
   */
  quoteColumnName(name) {
    return this.getSchema().quoteColumnName(name);
  }

  /**
   * Returns the query builder for the current DB connection.
   * @return {QueryBuilder}
   */
  getQueryBuilder() {
    return this.getSchema().getQueryBuilder();
  }

  /**
   * Creates a command for execution.
   *
   * @param {string} sql - the SQL statement to be executed
   * @param {{}} params - the parameters to be bound to the SQL statement
   * @return {Command}
   */
  createCommand(sql, params = {}) {
    return new Command({
      db: this,
      sql,
      params,
    });
  }

  getTableSchema(name, refresh = false) {
    return this.getSchema().getTableSchema(name, refresh);
  }

  getLastInsertID(sequenceName = '') {
    return this.getSchema().getLastInsertID(sequenceName);
  }

  getSchema() {
    throw new Error('need implementation getSchema() method for current class');
  }

  getActiveQuery(model) {
    return new ActiveQuery({db: this}, model);
  }

  /**
   *
   * @param {string} file
   * @returns {QueryResult[]}
   */
  async fileExecute(file) {
    const sqlLines = fs.readFileSync(file).
    toString().
    replace(/(\r\n|\n|\r)/gm, ' ').
    replace(/\s+/g, ' ').
    split(';').
    map(val => val.trim()).
    filter(val => val !== '');

    let result = [];
    for(let sql of sqlLines) {
      result.push(await this.createCommand(sql).execute());
    }
    return result;
  }

  execute(sql) {
    throw new Error(
        `need implementation execute() method for current class ${helper.className(
            this)}`);
  }

}

module.exports = BaseConnection;
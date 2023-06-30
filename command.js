const helper = require('./helper');
const Base = require('./base');
const Expression = require('./expression');

class Command extends Base {
  /*** @type {PgConnection|BaseConnection} db */
  db;
  params = {};
  /*** @type {string} the SQL statement that this command represents */
  sql;

  constructor(config) {
    super();
    this.setOwnProperties(config);
    this.bindValues(config.params ?? {});
  }

  getRawSql() {
    if (helper.empty(this.params)) {
      return this.sql;
    }

    let params = {};
    for (let key in this.params) {
      let name = key;
      if (/^\d+$/.test(key) === false && helper.strncmp(name, ':', 1)) {
        name = ':' + key;
      }
      let value = this.params[key];
      if (typeof value === 'string' || helper.instanceOf(value, Expression)) {
        params[name] = this.db.quoteValue(String(value));
        continue;
      }
      if (typeof value === 'boolean') {
        params[name] = value ? 'TRUE' : 'FALSE';
        continue;
      }
      if (value === null) {
        params[name] = 'NULL';
        continue;
      }
      if (typeof value == 'number') {
        params[name] = value;
      } else if (/^\d[\d.]*$/.test(value)) {
        params[name] = value;
      }
    }

    if (!helper.empty(params)) {
      return helper.replaceCallback(/(:\w+)/g, (matches) => {
        let match = matches[1];
        return params[match] ?? match;
      }, String(this.sql));
    }

    return this.sql;
  }

  bindValues(params) {
    if (params === void 0) {
      return this;
    }

    for (let key in params) {
      this.params[key] = params[key];
    }

    return this;
  }

  async query() {

  }

  async queryOne() {

  }

  async queryAll() {

  }

  async queryColumn() {

  }

  async queryScalar() {

  }

  /**
   * Creates an INSERT model command.
   * @param {ActiveRecord} model
   * @param {{}} values
   * @returns {Promise<*>}
   */
  async insertModel(model, values) {
    return await this.insert(model.constructor.tableName(), values);
  }

  /**
   * Creates an INSERT command.
   * @example
   * ```js
   *  db.createCommand().insert('user', {
   *    name: 'test-user',
   *    role: 'user',
   *    status: 1,
   *  })
   * ``
   * @param {string} table - the table that new rows() will be inserted into.
   * @param {{}} columns - the column data {name:value} to be inserted into the table.
   */
  async insert(table, columns) {
    let params = {};
    let sql = await this.db.getQueryBuilder().insert(table, columns, params);
    this.setSql(sql);
    this.bindValues(params);
    return await this.execute();
  }

  /**
   * Creates a batch INSERT command.
   * @example
   * ```js
   * db.createCommand().batchInsert('user', ['name', 'age'], [
   *     ['Tom', 21],
   *     ['Jerry', 20],
   *     ['Linda', 25],
   * ])
   * ``
   * @param {string} table - table the table that new rows() will be inserted into.
   * @param {[]} columns - columns the column names
   * @param {[]} rows - the rows to be batch inserted into the table
   */
  async batchInsert(table, columns, rows) {
    let sql = await this.db.getQueryBuilder().batchInsert(table, columns, rows);
    this.setSql(sql);
    return await this.execute();
  }

  /**
   * Creates an UPDATE command.
   * @example
   * ```js
   * db.createCommand().update('user', {status: 1}, 'age > 30')
   * ```
   * @param {string} table - the table to be updated.
   * @param {{}} columns - columns the column data {name:value} to be updated.
   * @param {string|[]|{}|Query} condition - the condition that will be put in the WHERE part
   * @param {{}} params - the parameters to be bound to the command
   * @returns {Promise<*>}
   */
  async update(table, columns, condition = '', params = {}) {
    let sql = await this.db.getQueryBuilder().
    update(table, columns, condition, params);
    this.setSql(sql);
    this.bindValues(params);
    return await this.execute();
  }

  /**
   * Creates an UPDATE AR model command.
   * @example
   * ```
   *
   * ```
   * @param model
   * @param values
   * @returns {Promise<void>}
   */
  async updateModel(model, values) {
    let condition = {}; // todo add
    return await this.update(model.constructor.tableName(), values, condition);
  }

  /**
   * Specifies the SQL statement to be executed.
   *
   * @param {string} sql
   * @returns {Command}
   */
  setSql(sql) {
    this.sql = sql;
    return this;
  }

  /**
   * Creates a DELETE command.
   * @example
   * ```js
   * db.createCommand().delete('user', 'status = 0')
   * db.createCommand().delete('user', {status: 0})
   * ```
   * @param {string} table - table the table where the data will be deleted from.
   * @param {string|{}|Query} condition - the condition that will be put in the WHERE part
   * @param {{}} params - the parameters to be bound to the command
   * @returns {Promise<*>}
   */
  async delete(table, condition = '', params = {}) {
    let sql = await this.db.getQueryBuilder().delete(table, condition, params);
    this.setSql(sql);
    this.bindValues(params);
    return await this.execute();
  }

  async upsert(table, insertColumns, updateColumns = true, params = {}) {
    let sql = await this.db.getQueryBuilder().
    upsert(table, insertColumns, updateColumns, params);
    this.setSql(sql);
    this.bindValues(params);
    return await this.execute();
  }

  /**
   * Creates a SQL command for creating a new DB() table.
   *
   * @param {string} table - the name of the table to be created. The name will be properly quoted by the method.
   * @param {{}} columns - the columns (name => definition) in the new table.()
   * @param {null|string} options - additional SQL fragment that will be appended to the generated SQL.
   * @returns {Promise<*>}
   */
  async createTable(table, columns, options = null) {
    let sql = await this.db.getQueryBuilder().createTable(table, columns, options);
    this.setSql(sql);
    return await this.execute();
  }

  async dropTable(table) {
    let sql = await this.db.getQueryBuilder().dropTable(table);
    this.setSql(sql);
    return await this.execute();
  }

  async execute() {
    const sql = this.getRawSql();
    return await this.db.execute(sql);
  }

}

module.exports = Command;
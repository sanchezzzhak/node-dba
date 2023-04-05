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

  query() {

  }

  queryOne() {

  }

  queryAll() {

  }

  queryColumn() {

  }

  queryScalar() {

  }

  /**
   * ```js
   *  connection.createCommand().insert('user', {
   *    name: 'test-user',
   *    role: 'user',
   *    status: 1,
   *  })
   * ``
   * @param {array} table
   * @param {object} columns
   */
  insert(table, columns) {

  }

  batchInsert(table, columns, rows) {

  }

  update(table, columns, condition = '', params = {}) {
    this.setSql(
        this.db.getQueryBuilder().update(table, columns, condition, params));
    return this.bindValues(params);
  }

  setSql(sql) {
    this.sql = sql;
    return this;
  }

  delete(table, condition = '', params = {}) {
    this.setSql(this.db.getQueryBuilder().delete(table, condition, params));
    return this.bindValues(params);
  }

  upsert($table, insertColumns, updateColumns = true, params = {}) {

  }

  async execute(){
    const sql = this.getRawSql();
    return await this.db.execute(sql)
  }

}

module.exports = Command;
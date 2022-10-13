class Command {
  /*** @type {PgConnection|BaseConnection} db */
  db;
  params = {};
  /*** @type {string} the SQL statement that this command represents */
  sql;
  
  constructor(config) {
    this.db = config.db;
    this.sql = config.sql ?? void 0;
    this.mode = config.mode ?? 'assoc';
    this.bindValues(config.params ?? {});
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
  
  }
  
  delete(table, condition = '', $params = {}) {
  
  }
  
  upsert($table, insertColumns, updateColumns = true, params = {}){
  
  }
  
}

module.exports = Command;
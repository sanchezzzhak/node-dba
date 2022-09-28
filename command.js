

class Command
{
  /***
   * @type {PgConnection|BaseConnection} db
   */
  db;
  mode = 'assoc'
  params = {}
  sql
  
  constructor(config) {
    this.db = config;
    this.sql = config.sql ?? void 0;
    this.mode = config.mode ?? 'assoc';
    this.params = config.params ?? {};
  }
  
}

module.exports = Command
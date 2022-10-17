const Base = require('./base');
const QueryBuilder = require('./query-builder');

class Schema extends Base
{
  /*** {Connection} @type */
  db;
  
  constructor(config = {}) {
    super(config);
    this.setOwnProperties(config);
  }
  
  getQueryBuilder() {
    return new QueryBuilder(this.db);
  }
  
  quoteValue(value) {
    return value;
  }
  
  quoteColumnName(name) {
    return name;
  }
  
}

module.exports = Schema;
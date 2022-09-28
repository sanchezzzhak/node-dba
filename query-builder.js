


class QueryBuilder
{
  /*** @type {PgConnection|Connection} - the database connection */
  db;
  /*** @type {string} - the separator between different fragments of a SQL statement. */
  separator = ' ';
  
  conditionBuilders = [];
  conditionObjects = [];
  expressionBuilders = [];
  
  constructor(db) {
    this.db = db;
  }
  
  build(query, params = {}) {
  
  }
  
  
}


module.exports = QueryBuilder;
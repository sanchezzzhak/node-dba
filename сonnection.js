const EventEmitter = require('eventemitter2');
const QueryBuilder = require('./query-builder');
const Command = require('./command');


const EVENTS = {
  EVENT_AFTER_OPEN: 'afterOpen',
  EVENT_BEFORE_OPEN: 'afterOpen',
  EVENT_CONNECT: 'connect',
  EVENT_ERROR: 'error',
  EVENT_BEGIN_TRANSACTION: 'beginTransaction',
  EVENT_COMMIT_TRANSACTION: 'commitTransaction',
  EVENT_ROLLBACK_TRANSACTION: 'rollbackTransaction',
}

class BaseConnection extends EventEmitter {
  
  EVENTS = EVENTS;
  
  static get driverName() {
    throw new Error('need implementation driverName() getter for current class')
  }

  async connect() {
    throw new Error('need implementation connect() method for current class')
  }
  
  async disconnect() {
    throw new Error('need implementation disconnect() method for current class')
  }
  
  quoteTableName(table) {
    throw new Error('need implementation quoteTableName() method for current class')
  }
  
  quoteValue(value) {
    throw new Error('need implementation quoteTableName() method for current class')
  }
  
  quoteColumnName(name) {
    throw new Error('need implementation quoteColumnName() method for current class')
  }
  
  /**
   * Returns the query builder for the current DB connection.
   * @return {QueryBuilder}
   */
  getQueryBuilder() {
    return new QueryBuilder(this);
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
      params
    });
  }
  
  getTableSchema(name, refresh = false){
    throw new Error('need implementation getQueryBuilder() method for current class')
  }
  
  getLastInsertID(sequenceName = '') {
    throw new Error('need implementation getLastInsertID() method for current class')
  }
  
}

module.exports = BaseConnection;

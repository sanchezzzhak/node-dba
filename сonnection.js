const EventEmitter = require('eventemitter2');

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
  
  /*** @type {string} the host required */
  host;
  /*** @type {number} the port required.*/
  port = 0;
  /*** @type {string} the database name required */
  database;
  /*** @type {string} the username for establishing DB connection. Defaults to `null` meaning no username to use. */
  username;
  /*** @type {string} he password for establishing DB connection. Defaults to `null` meaning no password to use. */
  password;
  /*** @type {Object} additional connection options */
  connectionOptions;
  
  #initConnection() {
  
  }
  
  static get driverName() {
    throw new Error('need implementation driverName() getter for current class')
  }
  
  checkInstallLib() {
    // skip default release
  }
  
  open() {
    throw new Error('need implementation open() method for current class')
  }
  
  close() {
    throw new Error('need implementation close() method for current class')
  }
  
}

module.exports = BaseConnection;

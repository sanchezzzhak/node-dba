/*** Base Events list */
export const EVENTS = {
  EVENT_AFTER_OPEN: 'afterOpen',
  EVENT_BEGIN_TRANSACTION: 'beginTransaction',
  EVENT_COMMIT_TRANSACTION: 'commitTransaction',
  EVENT_ROLLBACK_TRANSACTION: 'rollbackTransaction',
};

export const SCHEMA_MAPS = {
  'mysql': '',
  'pgsql': '',
};

export default class BaseConnection {
  EVENTS = EVENTS;
  /*** @type {string} the Data Source Name, or DSN, contains the information required to connect to the database.*/
  dsn;
  /*** @type {string} the username for establishing DB connection. Defaults to `null` meaning no username to use. */
  username;
  /*** @type {string} he password for establishing DB connection. Defaults to `null` meaning no password to use. */
  password;
  /*** @type {Object} additional connection options */
  connectionOptions;
  /*** @type {Object} driver lib */
  #driver;
  
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
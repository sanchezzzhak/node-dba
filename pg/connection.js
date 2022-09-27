const BaseConnection = require('../сonnection');
const {Pool, Client} = require('pg');

class Connection extends BaseConnection {
  
  /*** @type {Object} lib */
  #pool;
  
  static get getDriverName() {
    return 'pg';
  }
  
  constructor(config = {}) {
    super();
    this.host = config.host ?? 'localhost';
    this.port = config.port ?? 5432;
    this.database = config.database ?? '';
    this.username = config.username ?? void 0;
    this.password = config.password ?? void 0;
  }
  
  async open() {
    
    const pool = new Pool({
      host: this.host,
      database: this.database,
      user: this.username,
      password: this.password,
      port: this.port,
    });
    this.#pool = pool;
    
    pool.on('connect', (client) => {
      this.emit(this.EVENTS.EVENT_CONNECT, {client});
    });
    pool.on('error', (err, client) => {
      this.emit(this.EVENTS.EVENT_ERROR, {err, client});
    });
    
    this.emit(this.EVENTS.EVENT_AFTER_OPEN, {});
    try {
      await pool.query('SELECT NOW()');
    } catch (err) {
      this.emit(this.EVENTS.EVENT_ERROR, {err});
    }
    this.emit(this.EVENTS.EVENT_BEFORE_OPEN, {});
  }
  
}

module.exports = Connection;

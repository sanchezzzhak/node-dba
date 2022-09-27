const BaseConnection = require('../сonnection');
const {Pool, Client} = require('pg');

class PgConnection extends BaseConnection {
  
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
    if (this.#pool) {
      return;
    }
    const config = {
      host: this.host,
      database: this.database,
      user: this.username,
      password: this.password,
      port: this.port,
    };
    const pool = new Pool(config);
    
    pool.on('connect', (client) => {
      this.emit(this.EVENTS.EVENT_CONNECT, {client});
    });
    pool.on('error', (err, client) => {
      this.emit(this.EVENTS.EVENT_ERROR, {err, client});
    });
    this.#pool = pool;
    
    this.emit(this.EVENTS.EVENT_AFTER_OPEN, {});
    try {
      await pool.query('SELECT NOW()');
    } catch (err) {
      this.emit(this.EVENTS.EVENT_ERROR, {err});
    }
    
    this.emit(this.EVENTS.EVENT_BEFORE_OPEN, {});
  }
  
  async close(){
    if (!this.#pool) {
      return;
    }
    
    this.#pool.end();
    this.#pool.off();
    this.#pool = void 0;
  }
  
}

module.exports = PgConnection;

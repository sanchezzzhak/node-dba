const EventEmitter = require('eventemitter2');

class Base extends EventEmitter {
  
  constructor(config = {}) {
    super();
  }
  
  /**
   * DI set own properties
   * @param {*} config
   */
  setOwnProperties(config = {}) {
    for (let key in config) {
      this.hasOwnProperty(key) && (this[key] = config[key]);
    }
  }
}

module.exports = Base;
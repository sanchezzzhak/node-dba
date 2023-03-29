const EventEmitter = require('eventemitter2');

class Base extends EventEmitter {

  /**
   * DI set own properties
   * @param {{}} config
   */
  setOwnProperties(config = {}) {
    for (let [key, value] of Object.entries(config)) {
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    }
  }
}

module.exports = Base;
const fs = require('fs');
const path = require('path');
const Connection = require('./pg/connection');

const configMap = {};
const instances = {};
const SUPPORT_DRIVERS = [
  'pg'
];

export default class ConnectionManager
{
  /**
   * get db connection
   * @param {string} configName
   * @returns {*}
   */
  static instance(configName = 'db') {
    if(instances[configName] !== void 0) {
      return instances[configName];
    }
    
    let config = configMap[configName];
    if (!config) {
      throw new Error(`Config "${configName}" not found or not load`);
    }
    
    let driver = config['driver'];
    if (!driver) {
      throw new Error(`Not set section driver for config ${configName}`);
    }
    
    if (!SUPPORT_DRIVERS.includes(driver)) {
      throw new Error(`Unknown ${driver} driver`);
    }
    
    try {
      const conn = new (
        require('./' + driver + '/connection')
      )(config);
      conn.checkInstallLib();
      return instances[configName] = conn;
      
    } catch (err) {
      throw new Error(err);
    }
  }
  
  /**
   * load config for json or js files
   * @param dirPath
   */
  static loadConfigsForDir(dirPath) {
    fs.readdirSync(dirPath, {
      withFileTypes: true,
      recursive: false,
    })
    .filter((name => /\.(js|json)$/.test(name)))
    .forEach((file => {
      let name = path.parse(file).name;
      configMap[name] = require(dirPath + '/' + file);
    }));
    
  }

}
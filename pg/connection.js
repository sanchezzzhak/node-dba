const BaseConnection = require('../сonnection');
const { Pool } = require('pg');

export default class Connection extends BaseConnection
{
  static get getDriverName() {
    return 'pg';
  }
}
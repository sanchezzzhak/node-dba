const Base = require('./base');
const fs = require('node:fs');
const Query = require('/query');


class MigrationManager extends Base {

  /*** @type {PgConnection|ClickHouseConnection} db */
  db;
  /*** @type {string} migrations */
  migrations;
  /*** @type {string} migrationsTableName */
  migrationsTableName = 'migration';

  constructor(options = {}) {
    super();
    this.setOwnProperties(options)
  }

  async initMigrationHistory() {
    let migrationHistory = await this.db.getTableSchema(this.migrationsTableName, true);
    if (null === migrationHistory) {

    }
  }

  async run() {
    await this.initMigrationHistory();

    let query = (new Query()).select(['version', 'apply_time'])



  }
}
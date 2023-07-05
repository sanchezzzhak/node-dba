const Base = require('./base');
const fs = require('node:fs');
const Query = require('./query');
const OrderSort = require('./order-sort');
const helper = require('./helper');
const color = require('ansi-colors');
const {argv} = require('node:process');
const prompts = require('prompts');

class MigrationManager extends Base {

  /*** @type {PgConnection|ClickHouseConnection} db */
  db;
  /*** @type {string} migrations */
  migrations;
  /*** @type {string} migrationsTableName */
  migrationsTableName = 'migration';

  constructor(options = {}) {
    super();
    this.setOwnProperties(options);
  }

  async initMigrationHistory() {
    let migrationHistory = await this.db.getTableSchema(
        this.migrationsTableName, true);

    if (helper.empty(migrationHistory)) {
      try {
        console.log(color.yellow(`Init migration history`));
        console.log(color.yellow(
            `Creating migration history table "${this.migrationsTableName}"`),
        );

        await this.db.createCommand().createTable(this.migrationsTableName, {
          version: 'varchar(180) NOT NULL PRIMARY KEY',
          apply_time: 'integer',
        });
      } catch (e) {
        console.error(e);
        return false;
      }
    }
    return true;
  }

  async getMigrationHistory(limit = null) {
    const query = (new Query()).
    select(['version', 'apply_time']).
    from(this.migrationsTableName).
    orderBy({
      apply_time: OrderSort.DESC,
      version: OrderSort.DESC,
    });
    if (limit) {
      query.limit(limit);
    }
    return await query.map(this.db, 'version', 'apply_time');
  }

  async createMigrationHistory(version) {
    return await this.db.createCommand().insert(this.migrationsTableName, {
      version: version,
      apply_time: (new Date()).getTime(),
    });
  }

  async deleteMigrationHistory(version) {
    return await this.db.createCommand().delete(this.migrationsTableName, {
      version: version,
    });
  }

  static COMMAND_UP = 'up';
  static COMMAND_DOWN = 'down';
  static COMMAND_CREATE = 'create';

  async run() {
    const isInit = await this.initMigrationHistory();
    if (!isInit) {
      return false;
    }
    switch (argv[2] ?? MigrationManager.COMMAND_UP) {
      case MigrationManager.COMMAND_UP:
        await this.runCommandUp(parseInt(argv[3] ?? 0));
        break;
      case MigrationManager.COMMAND_DOWN:
        await this.runCommandDown(parseInt(argv[3] ?? 0));
        break;
      case MigrationManager.COMMAND_CREATE:
        break;
    }
  }

  async runCommandUp(limit) {
    let history = await this.getMigrationHistory(null);
    let migrations = {};
    let newMigrations = [];
    fs.readdirSync(this.migrations, {
      withFileTypes: true,
    }).filter((file => /\.(js)$/.test(file.name))).forEach((file => {
      let fileName = file.name;
      let name = path.parse(fileName).name;

      if (!history[name]) {
        newMigrations.push(name);
      }
    }));

    if (newMigrations.length === 0) {
      console.log(
          color.green(`No new migration found. Your system is up-to-date`));
      return true;
    }
    newMigrations.sort();
    if (limit > 0) {
      newMigrations = newMigrations.splice(0, limit);
    }
    console.log(color.yellow(`Total migrations to be applied:`));
    newMigrations.forEach((migration => {
      console.log(color.yellow(`  ${migration}`));
    }));

    let answersSelect = ['y', 'yes', 'n', 'no'];
    let answer = await prompts([
      {
        type: 'text',
        name: 'value',
        message: `Apply the above migrations (${answersSelect.join(',')})?`,
        validate: value => answersSelect.includes(value.toLowerCase())
      },
    ]);
    if (['y', 'yes'].includes(answer.value)) {
      return true;
    }
    if (['n', 'no'].includes(answer.value)) {
      console.log(color.red('Operations are canceled.'))
      return true;
    }
    console.log({migrations, history, answer});
  }

  async runCommandDown(limit) {
    const history = await this.getMigrationHistory(limit);
  }

}

module.exports = MigrationManager;
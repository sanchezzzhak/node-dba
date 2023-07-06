# node-dba (this project in process developing dont not use in production)
* Micro engine for active record layout for database (MySQL, Postgress, ClickHouse)

-----

#### Config Supports json or js files
* js 
```js
// recommendations https://www.npmjs.com/package/dotenv

const PostgressConfig = {
  driver: 'pg',
  database: process.env.PG_DATABASE,
  username: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  connectionOptions: {},
}
module.exports = PostgressConfig;
```
save the config to any folder for example `config/local/db/pg.js`

#### Base usage

```js
const {DBA} = require('node-dba');
// init all configs for dir
DBA.loadConfigsForDir(__dirname + '/config/local/db');
// ...
// get db connect
const db = DBA.instance('pg');
```

#### Query Builder
```js
const {DBA, Query} = require('node-dba');
const db = DBA.instance('pg');
const query = new Query();
const result = await query.select(['id', 'name'])
.from('users')
.all(db)
```

* [Where](docs/WHERE.MD)
* [Order By](docs/ORDER_BY.MD)
* [Group By](docs/GROUP_BY.MD)
* [Having](docs/HAVING.MD)



#### Migration
Create `bin/dba-migrate.js` file locally and implement the following code.
```js
const {DBA, MigrationManager} = require('node-dba');

DBA.loadConfigsForDir(__dirname + '/config/local/db');
const migrationManager = new MigrationManager({
  // the path where to look for migrations
  migrations: __dirname + '/migrations',
  migrationsTableName: 'migration'
});

migrationManager.run();
```
The following commands will be available to you.
* create blank migrate `node bin/dba-migrate create <name migration>` 
* apply migrate `node node bin/dba-migrate up <count option>`
* revert migrate `node bin/dba-migrate down <count option>`

Example manual create migrate class
```js
const {Migration} = require('node-dba');

class UserTable extends Migration {

  async up(){
    await this.createTable('table name', {
        'id' : this.pk(),
        'email': this.string()
    });
    return true;
  }

  async down(){
    await this.dropTable('table name');
    return true;
  }
}

module.exports = UserTable;
```

Migration class methods available for `up()/down()` methods
```js
 /*** @type this {Migration} */
 await this.createTable ('table name', {}, null);
 await this.dropTable ('table name')
 await this.renameTable('table name', 'table new name')
 await this.truncateTable('table name')
 await this.addColumn('table name')
 await this.addColumn('table name', 'column name', type);
 await this.dropColumn('table name', 'column name');
 await this.alterColumn('table name', 'column name', type);
 await this.renameColumn('table name', 'column name', 'column new name'); 
 await this.addPrimaryKey('name', 'table name', columns);
 await this.dropPrimaryKey('name', 'table name');
 await this.createIndex('name', 'table name', columns, unique = false);
 await this.dropIndex('name', 'table name');
 await this.addForeignKey('name ForeignKey', 'table name', columns, refTable, refColumns, delete = null, update = null); 
 await this.dropForeignKey('name ForeignKey', 'table name');
```

#### CRUD
Create `bin/dba-crud.js` file locally and implement the following code.
```js
const {DBA, CrudManager} = require('node-dba');
DBA.loadConfigsForDir(__dirname + '/config/local/db');
const crudManager = new CrudManager({
  // path where to save new models
  models: __dirname + '/models',
});

crudManager.run();
```
The following commands will be available to you.
* create active record model `node bin/dba-crud.js create-model <table name>` 
* create active query `node bin/dba-crud.js create-query <table name>`

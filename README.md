# node-dba (this project in process developing dont not use in production)
Micro engine for active record layout for database (MySQL, Postgress, ClickHouse)
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

let result = await query.select(['id', 'name'])
.from('users')
.all(db)
```

#### Query Order By
Support query methods:
* addOrderBy
* orderBy

String mode:
```js
const query = new Query();
let result = await query.select(['id', 'name'])
.from('users')
.orderBy("name DESC, id ASC")
.all(db)
```

Array mode:
```js
const query = new Query();
let result = await query.select(['id', 'name'])
.from('users')
.orderBy(["name DESC", "id ASC"])
.all(db)
```

Object mode:
```js
let result = await query.select(['id', 'name'])
.from('users')
.addOrderBy({name: "desc"})
.all(db)
```

Expression mode:
```js
let expression1 = new Expression('SUBSTR(name, 3, 40) DESC, id ASC');
let result = await query.select(['id', 'name'])
.from('users')
.query.andOrderBy(expression1)
.all(db)
```

Order class mode:
```js
let order1 = new Order('column_name', Order.SORT_DESC);
let result = await query.select(['id', 'name'])
.from('users')
.query.andOrderBy(order1)
.all(db)
```
Or combined mode the array
```js
let order1 = new Order('column_name', Order.SORT_DESC);
let result = await query.select(['id', 'name'])
.from('users')
.query.andOrderBy([order1, "id DESC"])
.all(db)
```

#### Migration usage
* create migrate `node node_modules/bin/dba migrate/create <db> <name migration>`
* commit migrate `node node_modules/bin/dba migrate/up <db> <count option>`
* rollback migrate `node node_modules/bin/dba migrate/down <db> <count option> <db>`

#### CRUD usage
* create active record model `node node_modules/bin/dba crud/create-model <db> <table name> <save to path>`
* create active query `node node_modules/bin/dba crud/create-query <db> <table name> <save to path>`
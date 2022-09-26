# node-dba
Micro engine for active record layout for database (MySQL, Postgress, ClickHouse)


#### Config Supports json or js files
* js 
```js
// recommendations https://www.npmjs.com/package/dotenv

const PostgressConfig = {
  driver: 'pg',
  dsn: 'localhost:5001',
  database: process.env.PG_DATABASE,
  username: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
}
export default PostgressConfig;
```
save the config to any folder for example `config/local/db/pg.js`

#### Base usage

```js
const dba = require('node-dba');
dba.loadConfigsForDir(__dirname + '/config/local/db');
const conn = dba.instance('db');
conn.on('openBefore', (event, err) => {
  !err 
  ? console.log('connection success')
  : console.error('connection error', err);
});
conn.open();

```

#### Migration usage
* create migrate `node node_modules/bin/dba migrate/create <db> <name migration>`
* commit migrate `node node_modules/bin/dba migrate/up <db> <count option>`
* rollback migrate `node node_modules/bin/dba migrate/down <db> <count option> <db>`

#### CRUD usage
* create active record model `node node_modules/bin/dba crud/create-model <db> <table name> <save to path>`
* create active query `node node_modules/bin/dba crud/create-query <db> <table name> <save to path>`

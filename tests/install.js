const {DBA} = require('../index');
DBA.loadConfigsForDir(__dirname + '/config/db/');

const FILE_DUMP = __dirname + '/dumps/pg/dump.sql';

(async () => {
  const db = DBA.instance('pg');

  console.log('current version PG: %s',
      (await db.createCommand('SELECT version()').execute()).rows.shift().version
  );
})();







# Query Group By

Support query methods:
* groupBy
* addGroupBy

String mode:
```js
const {DBA, Query} = require('node-dba');
const db = DBA.instance('pg');

const query = new Query();
const result = await query.select(['id', 'name'])
.from('users')
.groupBy("name")
.all(db)
```
Array mode:
```js
const {DBA, Query} = require('node-dba');
const db = DBA.instance('pg');

const query = new Query();
const result = await query.select(['id', 'name'])
.from('users')
.addGroupBy(["name", "id"])
.all(db)
```
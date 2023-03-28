# Query Order By

Support query methods:
* orderBy
* addOrderBy

```js
const {DBA, Query} = require('node-dba');
const db = DBA.instance('pg');
```

String mode:
```js
const query = new Query();
const result = await query.select(['id', 'name'])
.from('users')
.orderBy("name DESC, id ASC")
.all(db)
```
Array mode:
```js
const query = new Query();
const result = await query.select(['id', 'name'])
.from('users')
.orderBy(["name DESC", "id ASC"])
.all(db)
```
Object mode:
```js
const query = new Query();
const result = await query.select(['id', 'name'])
.from('users')
.addOrderBy({name: "desc"})
.all(db)
```

Expression mode:
```js
const query = new Query();
const expression1 = new Expression('SUBSTR(name, 3, 40) DESC, id ASC');
const result = await query.select(['id', 'name'])
.from('users')
.query.addOrderBy(expression1)
.all(db)
```
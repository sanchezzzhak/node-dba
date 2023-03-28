# Query Where

Support query methods:
* andWhere
* orWhere
* where
* filterWhere
* andFilterWhere
* orFilterWhere

```js
const {DBA, Query} = require('node-dba');
const db = DBA.instance('pg');
```
filterWhere

```js
    const query = new Query();
    query.from('user')
    query.filterWhere(['like', 'name', 'Odyssey']).all(db);
```
generate text sql
```sql
SELECT * FROM "user" WHERE "name" LIKE 'Odyssey'
```
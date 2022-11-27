const {should, assert, expect} = require('chai');
const DBA = require('../index');
const Query = require('../query');

DBA.loadConfigsForDir(__dirname + '/config/db');

const TIMEOUT = 20000;
const PG = 'pg';

describe('tests connections', function() {
  this.timeout(TIMEOUT);
  
  it('postgress test connection', async function() {
    let db = DBA.instance(PG);
    await db.connect();
    await db.disconnect();
    return Promise.resolve();
  });
  
  it('test impl pg driverName', async function() {
    let db = DBA.instance(PG);
    expect(db.constructor.getDriverName).to.equal('pg');
  });
  
  it('test query', function () {
    let db = DBA.instance(PG);
    let query = new Query();
    query.select(['column1', 'column2']).from('customer');
    expect(db.constructor.getDriverName).to.equal('pg');
    let sql = query.createCommand(db).getRawSql();
    console.log({sql});

    expect('SELECT "column1", "column2" FROM "customer"').to.equal(sql);
  });



});
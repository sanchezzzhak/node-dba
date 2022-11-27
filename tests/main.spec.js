const {should, assert, expect} = require('chai');
const {DBA, Query} = require('../index');

DBA.loadConfigsForDir(__dirname + '/config/db');

const TIMEOUT = 20000;
const PG = 'pg';

describe('tests connections', function () {
  this.timeout(TIMEOUT);

  it('postgress test connection', async function () {
    let db = DBA.instance(PG);
    await db.connect();
    await db.disconnect();
    return Promise.resolve();
  });

  it('test impl pg driverName', async function () {
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

  it('test select all for Query', function () {
    let query = new Query();
    query.select('*');
    expect({'*': '*'}).to.deep.equal(query.getSelect());
    expect(false).to.equal(query.getDistinct());
    expect('').to.equal(query.getSelectOption());
  })

  it('test select distinct for Query', function () {
    let query = new Query();
    query.select('id, name', 'something').distinct(true);
    expect({'id': 'id', 'name': 'name'}).to.deep.equal(query.getSelect());
    expect(true).to.equal(query.getDistinct());
    expect('something').to.equal(query.getSelectOption());
  });

  it('test addSelect for Query', function () {
    let query = new Query();
    query.addSelect('email');
    expect({'email': 'email'}).to.deep.equal(query.getSelect());
  })

  it('test select + addSelect for Query', function () {
    let query = new Query();
    query.select('id, name');
    query.addSelect('email');
    expect({'id': 'id', 'name': 'name', 'email': 'email'}).to.deep.equal(query.getSelect());
  })


});
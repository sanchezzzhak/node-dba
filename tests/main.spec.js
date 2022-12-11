const {should, assert, expect} = require('chai');
const {DBA, Query, Expression} = require('../index');

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

  it('test select * for Query', function () {
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

    query = new Query();
    query.addSelect(['*', 'abc']);
    query.addSelect(['*', 'bca']);
    expect({'*': '*', 'abc': 'abc', 'bca': 'bca'}).to.deep.equal(query.getSelect());

  })

  it('test select + addSelect for Query', function () {
    let query = new Query();
    query.select('id, name');
    query.addSelect('email');
    expect({'id': 'id', 'name': 'name', 'email': 'email'}).to.deep.equal(query.getSelect());
  })

  it('test select alias for Query', function () {
    let query = new Query();
    query.addSelect(['field1 as a', 'field 1 as b']);
    expect({'a': 'field1', 'b': 'field 1'}).to.deep.equal(query.getSelect());

    query = new Query();
    query.addSelect(['field1 a', 'field 1 b']);
    expect({'a': 'field1', 'b': 'field 1'}).to.deep.equal(query.getSelect());

    query = new Query();
    query.select('name, name, name as X, name as X');
    expect({'name': 'name', 'X': 'name'}).to.deep.equal(query.getSelect());

    query = (new Query()).select('id');
    expect({'id': 'id'}).to.deep.equal(query.getSelect());
    query.select(['id', 'brand_id']);
    expect({'id': 'id', 'brand_id': 'brand_id'}).to.deep.equal(query.getSelect());
  })

  it('test select function for Query', function () {
    let query = (new Query()).select({
      'prefix': 'LEFT(name, 7)',
      'prefix_key': 'LEFT(name, 7)'
    });
    query.addSelect(['LEFT(name,8) as test']);
    expect({
      'prefix': 'LEFT(name, 7)',
      'prefix_key': 'LEFT(name, 7)',
      'test': 'LEFT(name,8)',
    }).to.deep.equal(query.getSelect());
  });

  it('test from Expression', function () {
    let query = new Query();
    let tables = new Expression('(SELECT id,name FROM user) u');
    query.from(tables);
    assert.instanceOf(query.getFrom()[0], Expression);
  })

  it('test from for Query', function () {
    let query = new Query();
    query.from('user');
    expect(['user']).to.deep.equal(query.getFrom());

    query = new Query();
    query.from('user as u');
    expect(['user as u']).to.deep.equal(query.getFrom());
  })

  it('test where for Query', function () {
    let query = new Query();
    query.where('id = :id', {':id': 1});
    expect({':id': 1}).to.deep.equal(query.getParams());
    expect('id = :id').equal(query.getWhere());

    query.andWhere('name = :name', {':name': 'something'});
    expect({':id': 1, ':name': 'something'}).to.deep.equal(query.getParams());
    expect(['and', 'id = :id', 'name = :name']).to.deep.equal(query.getWhere());

    query.orWhere('age = :age', {':age': '33'})
    expect({':id': 1, ':name': 'something', ':age': '33'}).to.deep.equal(query.getParams());
    expect(['or', ['and', 'id = :id', 'name = :name'], 'age = :age']).to.deep.equal(query.getWhere());

    query.from(['profiles'])

    let db = DBA.instance(PG);
    let sql = query.createCommand(db).getRawSql();
    expect(`SELECT *  FROM "profiles" WHERE ((id = 1) AND (name = 'something')) OR (age = 33)`).equal(sql);
  });

  it('test filter hash where for Query', function () {
    let query = new Query();
    query.filterWhere({
      'id': 0,
      'title': '   ',
      'author_ids': [],
    });
    expect({'id': 0}).to.deep.equal(query.getWhere());

    query.andFilterWhere({'status': null});
    expect({'id': 0}).to.deep.equal(query.getWhere());

    query.orFilterWhere({'name': '', hello: void 0});
    expect({'id': 0}).to.deep.equal(query.getWhere());
  })

  it('test filter array where for Query', function () {
    let condition = ['like', 'name', 'Odyssey'];
    let query = new Query();
    query.filterWhere(condition);
    expect(condition).to.deep.equal(query.getWhere());

    query.andFilterWhere(['between', 'id', null, null]);
    expect(condition).to.deep.equal(query.getWhere());
    query.orFilterWhere(['not between', 'id', null, null]);
    expect(condition).to.deep.equal(query.getWhere());

    query.andFilterWhere(['in', 'id', []]);
    expect(condition).to.deep.equal(query.getWhere());

    query.andFilterWhere(['not in', 'id', []]);
    expect(condition).to.deep.equal(query.getWhere());

    query.andFilterWhere(['like', 'id', '']);
    expect(condition).to.deep.equal(query.getWhere());

    query.andFilterWhere(['or like', 'id', '']);
    expect(condition).to.deep.equal(query.getWhere());

    query.andFilterWhere(['not like', 'id', '   ']);
    expect(condition).to.deep.equal(query.getWhere());

    query.andFilterWhere(['or not like', 'id', null]);
    expect(condition).to.deep.equal(query.getWhere());

    query.andFilterWhere(['or', ['eq', 'id', null], ['eq', 'id', []]]);
    expect(condition).to.deep.equal(query.getWhere());
  })

  it('test filter having for Query', function() {
    let query = new Query();
    query.filterHaving({
      'id': 0,
    });
    expect({'id': 0}).to.deep.equal(query.getHaving());
  })


});
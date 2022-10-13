const {should, assert, expect} = require('chai');
const DBA = require('../index');
const Query = require('../query');

DBA.loadConfigsForDir(__dirname + '/config/db');

const TIMEOUT = 20000;
const DB = 'pg';


describe('tests connections', function() {
  this.timeout(TIMEOUT);
  
  it('postgress test connection', async function() {
    let db = DBA.instance(DB);
    await db.connect();
    await db.disconnect();
    return Promise.resolve();
  });
  
  it('test query', async function() {
    let db = DBA.instance(DB);
    let query = new Query();
    query.select(['1 as ping']);
    query.one(db);
  });
  
  
  
});
const {should, assert, expect} = require('chai');
const DBA = require('../index');

DBA.loadConfigsForDir(__dirname + '/config/db');

const TIMEOUT = 20000;

describe('tests connections', function() {
  this.timeout(TIMEOUT);
  
  it('postgress test connection', async function() {
    let db = DBA.instance('pg');
    db.on(db.EVENTS.EVENT_CONNECT, (client) => {
    });
    db.on(db.EVENTS.EVENT_ERROR, (err) => {
      console.error('test-error:', err);
    });
  
    await db.connect();
    let builder = db.getQueryBuilder();
    
    return Promise.resolve();
  });
  
});
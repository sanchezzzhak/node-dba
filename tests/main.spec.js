const {should, assert, expect} = require('chai');
const DBA = require('../index');

DBA.loadConfigsForDir(__dirname + '/config/db');

const TIMEOUT = 20000;

describe('tests connections', function() {
  this.timeout(TIMEOUT);
  
  it('postgress test connection', async function() {
    let conn = DBA.instance('pg');
    conn.on(conn.EVENTS.EVENT_CONNECT, (client) => {
    });
    conn.on(conn.EVENTS.EVENT_ERROR, (err) => {
      console.error('test-error:', err);
    });
    
    try {
      await conn.open();
    } catch (e) {
    }
    return Promise.resolve();
  });
  
});
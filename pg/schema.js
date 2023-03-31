const BaseSchema = require('../schema');

class Schema extends BaseSchema
{
  tableQuoteCharacter = '"';

  constructor(config) {
    super(config);
  }

  async loadTableSchema(name) {
    const table = new TableSchema();


    return null;
  }

}

module.exports = Schema;
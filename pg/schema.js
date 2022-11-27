const BaseSchema = require('../schema');

class Schema extends BaseSchema
{
  tableQuoteCharacter = '"';

  constructor(config) {
    super(config);
  }
}

module.exports = Schema;
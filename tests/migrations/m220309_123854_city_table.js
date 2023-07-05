const Migrate = require('../../migration')

class city_table extends Migrate {

  async up() {

    return true;
  }

}

module.exports = city_table
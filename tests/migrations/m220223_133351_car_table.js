const Migrate = require('../../migration')

class car_table extends Migrate {

  async up() {

    return true;
  }

}

module.exports = car_table
const Migrate = require('../../migration')

class car_table extends Migrate {

  CAR_TABLE = 'car';

  async up() {
    await this.createTable(this.CAR_TABLE, {
       'id' : this.primaryKey(),
       'brand': this.string().notNull(),
       'model': this.string().notNull(),
       'created_at' : this.timestamp(),
       'updated_at' : this.timestamp()
    })
    return true;
  }

  async down() {
    await this.dropTable(this.CAR_TABLE);
    return true;
  }

}

module.exports = car_table
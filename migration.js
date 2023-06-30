
class Migration {
  db;

  /**
   * This method contains the logic to be executed when applying this migration.
   * This method differs from [[up()]] in that the DB logic implemented here will
   * be enclosed within a DB transaction.
   * Child classes may implement this method instead of [[up()]] if the DB logic
   * needs to be within a transaction.
   * @returns {Promise<void>}
   */
  async safeUp() {

  }

  /**
   * This method contains the logic to be executed when removing this migration.
   * This method differs from [[down()]] in that the DB logic implemented here will
   * be enclosed within a DB transaction.
   * Child classes may implement this method instead of [[down()]] if the DB logic
   * needs to be within a transaction.
   * @returns {Promise<void>}
   */
  async safeDown() {

  }

  async up() {


  }

  async down() {

  }



}

module.exports = Migration;
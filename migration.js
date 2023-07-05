
class Migration {
  db;

  /**
   * This method contains the logic to be executed when applying this migration.
   * This method differs from [[up()]] in that the DB logic implemented here will
   * be enclosed within a DB transaction.
   * Child classes may implement this method instead of [[up()]] if the DB logic
   * needs to be within a transaction.
   * @returns {Promise<boolean>}
   */
  async up() {
    return true;
  }
  /**
   * This method contains the logic to be executed when removing this migration.
   * This method differs from [[down()]] in that the DB logic implemented here will
   * be enclosed within a DB transaction.
   * Child classes may implement this method instead of [[down()]] if the DB logic
   * needs to be within a transaction.
   * @returns {Promise<boolean>}
   */
  async down() {
    return true;
  }



}

module.exports = Migration;
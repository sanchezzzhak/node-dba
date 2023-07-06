class Migration {
  db;

  /**
   * This method contains the logic to be executed when applying this migration.
   * This method differs from [[up()]] in that the DB logic implemented here will
   * be enclosed within a DB transaction.
   * Child classes may implement this method instead of [[up()]] if the DB logic
   * needs to be within a transaction.
   *
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
   *
   * @returns {Promise<boolean>}
   */
  async down() {
    return true;
  }

  /**
   * Builds and executes a SQL statement for creating a new DB table.
   *
   * @param {string} table
   * @param {{}} columns
   * @param {string|null} options
   * @returns {Promise<void>}
   */
  async createTable(table, columns, options = null) {
    await this.db.createCommand().createTable(table, columns, options);
    for (let [type, column] of Object.entries(columns)) {
      // added comment to column
    }
  }

  /**
   * Builds and executes a SQL statement for dropping a DB table.
   *
   * @param {string} table
   * @returns {Promise<void>}
   */
  async dropTable(table) {
    await this.db.createCommand().dropTable(table);
  }

  /**
   * Builds and executes a SQL statement for renaming a DB table.
   *
   * @param {string} fromTable
   * @param {string} toTable
   * @returns {Promise<void>}
   */
  async renameTable(fromTable, toTable) {
    await this.db.createCommand().renameTable(fromTable, toTable);
  }

  /**
   * Builds and executes a SQL statement for truncating a DB table.
   *
   * @param {string} table
   * @returns {Promise<void>}
   */
  async truncateTable(table) {
    await this.db.createCommand().truncateTable(table);
  }

}

module.exports = Migration;
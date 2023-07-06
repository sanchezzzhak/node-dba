const Schema = require('./schema');

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

  /**
   * Creates a primary key column.
   *
   * @param {number|null} length
   * @returns {*|ColumnSchemaBuilder}
   */
  primaryKey(length = null) {
    return this.createColumnSchemaBuilder(Schema.TYPE_PK, length);
  }

  /**
   * Creates a big primary key column.
   *
   * @param {number|null}  length
   * @returns {*|ColumnSchemaBuilder}
   */
  bigPrimaryKey(length = null) {
    return this.createColumnSchemaBuilder(Schema.TYPE_BIGPK, length);
  }

  /**
   * Creates a char column.
   *
   * @param {number|null} length
   * @returns {*|ColumnSchemaBuilder}
   */
  char(length = null) {
    return this.createColumnSchemaBuilder(Schema.TYPE_CHAR, length);
  }

  /**
   * Creates a string column.
   *
   * @param {number|null} length
   * @returns {*|ColumnSchemaBuilder}
   */
  string(length = null) {
    return this.createColumnSchemaBuilder(Schema.TYPE_STRING, length);
  }

  /**
   * Creates a text column.
   *
   * @returns {*|ColumnSchemaBuilder}
   */
  text() {
    return this.createColumnSchemaBuilder(Schema.TYPE_STRING);
  }

  /**
   *  Creates a tinyint column. If tinyint is not supported by the DBMS, smallint will be used.
   *
   * @param {number|null} length
   * @returns {*|ColumnSchemaBuilder}
   */
  tinyInteger(length = null) {
    return this.createColumnSchemaBuilder(Schema.TYPE_TINYINT, length);
  }

  /**
   * Creates a smallint column.
   *
   * @param {number|null} length
   * @returns {*|ColumnSchemaBuilder}
   */
  smallInteger(length = null) {
    return this.createColumnSchemaBuilder(Schema.TYPE_SMALLINT, length);
  }

  /**
   * Creates an integer column.
   *
   * @param {number|null} length
   * @returns {*|ColumnSchemaBuilder}
   */
  integer(length = null) {
    return this.createColumnSchemaBuilder(Schema.TYPE_SMALLINT, length);
  }

  /**
   * Creates a bigint column.
   *
   * @param {number|null} length
   * @returns {*|ColumnSchemaBuilder}
   */
  bigInteger(length) {
    return this.createColumnSchemaBuilder(Schema.TYPE_BIGINT, length);
  }

  /**
   * Creates a float column.
   *
   * @param {number|null} precision
   * @returns {*|ColumnSchemaBuilder}
   */
  float(precision = null) {
    return this.createColumnSchemaBuilder(Schema.TYPE_FLOAT, precision);
  }

  /**
   * Creates a double column.
   *
   * @param {number|null} precision
   * @returns {*|ColumnSchemaBuilder}
   */
  double(precision = null) {
    return this.createColumnSchemaBuilder(Schema.TYPE_DOUBLE, precision);
  }

  /**
   * Creates a decimal column.
   *
   * @param {number|null} precision
   * @param {number|null} scale
   * @returns {*|ColumnSchemaBuilder}
   */
  decimal(precision = null, scale = null) {
    let length = [];
    if (precision !== null) {
      length.push(precision);
    }
    if (scale !== null) {
      length.push(scale);
    }
    return this.createColumnSchemaBuilder(Schema.TYPE_DECIMAL, length);
  }

  /**
   * Creates a datetime column.
   * @param {number|null} precision
   * @returns {*|ColumnSchemaBuilder}
   */
  dateTime(precision = null){
    return this.createColumnSchemaBuilder(Schema.TYPE_DATETIME, precision);
  }

  /**
   * Creates a timestamp column.
   *
   * @param {number|null} precision
   * @returns {*|ColumnSchemaBuilder}
   */
  timestamp(precision = null){
    return this.createColumnSchemaBuilder(Schema.TYPE_TIMESTAMP, precision);
  }

  /**
   * Creates a time column.
   *
   * @param {number|null} precision
   * @returns {*|ColumnSchemaBuilder}
   */
  time(precision = null){
    return this.createColumnSchemaBuilder(Schema.TYPE_TIME, precision);
  }

  /**
   * Creates a date column
   *
   * @returns {*|ColumnSchemaBuilder}
   */
  date() {
    return this.createColumnSchemaBuilder(Schema.TYPE_DATE);
  }

  /**
   * Creates a binary column.
   *
   * @param {number|null} length
   * @returns {*|ColumnSchemaBuilder}
   */
  binary(length = null) {
    return this.createColumnSchemaBuilder(Schema.TYPE_BINARY, length);
  }

  /**
   * Creates a boolean column.
   *
   * @returns {*|ColumnSchemaBuilder}
   */
  boolean() {
    return this.createColumnSchemaBuilder(Schema.TYPE_BOOLEAN);
  }

  /**
   * Creates a money column.
   * @param {}precision
   * @param scale
   */
  money(precision = null, scale = null) {
    return this.createColumnSchemaBuilder(Schema.TYPE_MONEY);
  }

  /**
   * @param {string} type
   * @param {number|null} length
   * @returns {*|ColumnSchemaBuilder}
   */
  createColumnSchemaBuilder(type, length= null) {
    return this.db.createColumnSchemaBuilder(type, length);
  }

}

module.exports = Migration;
const Base = require('./base');

class ColumnSchema extends Base {

  /**
   * @type {string}  string name of this column (without quotes).
   */
  name;
  /**
   * @type {boolean} whether this column can be null.
   */
  allowNull;
  /**
   * @type {string} abstract type of this column. Possible abstract types include:
   * char, string, text, boolean, smallint, integer, bigint, float, decimal, datetime,
   * timestamp, time, date, binary, and money.
   */
  type;
  /**
   * @type {string}
   */
  jsType;
  /**
   * @type {string} the DB type of this column. Possible DB types vary according to the type of DBMS.
   */
  dbType;
  /**
   * @type {*}
   */
  defaultValue;
  /**
   * @type {array|{}} enumerable values. This is set only if the column is declared to be an enumerable type.
   */
  enumValues;
  /**
   * @type {number} display size of the column.
   */
  size;
  /**
   * @type {number} precision of the column data, if it is numeric.
   */
  precision;

  /**
   * @type {number} scale of the column data, if it is numeric.
   */
  scale;
  /**
   * @type {boolean} whether this column is a primary key
   */
  isPrimaryKey = false;
  /**
   * @type {boolean} whether this column is auto-incremental
   */
  autoIncrement = false;
  /**
   * @type {boolean} whether this column is unsigned. This is only meaningful
   * when [[type]] is `smallint`, `integer` or `bigint`.
   */
  unsigned;
  /**
   * @type {string} string comment of this column. Not all DBMS support this.
   */
  comment;

  jsTypecast(value) {
    return this.typecast(value);
  }

  dbTypecast(value) {
    return this.typecast(value);
  }

  typecast(value) {
    return void 0;
  }
}

module.exports =ColumnSchema;
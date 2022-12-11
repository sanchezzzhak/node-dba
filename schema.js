const Base = require('./base');
const QueryBuilder = require('./query-builder');
 const helper = require('./helper');

class Schema extends Base {
  /*** {Connection} @type */
  db;

  tableQuoteCharacter = "'";
  columnQuoteCharacter = '"';

  constructor(config = {}) {
    super(config);
    this.setOwnProperties(config);
  }

  getQueryBuilder() {
    return new QueryBuilder(this.db);
  }

  quoteValue(value) {
    if (typeof value == 'number') {
      return value;
    } else if (/^\d[\d.]*$/.test(value)) {
      return value;
    }

    return "'" + helper.addcslashes(value.replaceAll("'", "''"), "\\000\n\r\\032") + "'";
  }

  /**
   * Quotes a column name for use in a query.
   * If the column name contains prefix, the prefix will also be properly quoted.
   * If the column name is already quoted or contains '(', '[[' or '{{',
   * then this method will do nothing.
   *
   * @param {string} name - column name
   * @returns {string} - the properly quoted column name
   */
  quoteColumnName(name) {
    if (name.indexOf('(') !== -1 || name.indexOf('[[') !== -1) {
      return name;
    }
    let prefix = '';
    let pos = name.indexOf('.');
    if (pos !== -1) {
      prefix = this.quoteTableName(name.substr(0, pos)) + '.';
      name = name.substr(pos + 1);
    }
    if (name.indexOf('{{') !== -1) {
      return name;
    }

    return prefix + this.quoteSimpleColumnName(name);
  }

  /**
   * Quotes a simple column name for use in a query.
   * A simple column name should contain the column name only without any prefix.
   * If the column name is already quoted or is the asterisk character '*', this method will do nothing.
   *
   * @param {string} name - column name
   * @returns {string} - the properly quoted column name
   */
  quoteSimpleColumnName(name) {
    return name === '*' || name.indexOf(this.columnQuoteCharacter) !== -1
      ? name
      : this.columnQuoteCharacter + name + this.columnQuoteCharacter;
  }

  /**
   * Quotes a simple table name for use in a query.
   * A simple table name should contain the table name only without any schema prefix.
   * If the table name is already quoted, this method will do nothing.
   * @param {string} name - table name
   * @returns {string} - the properly quoted table name
   */
  quoteSimpleTableName(name) {
    return name.indexOf(this.tableQuoteCharacter) !== -1
      ? name
      : this.tableQuoteCharacter + name + this.tableQuoteCharacter;
  }

  /**
   * Quotes a table name for use in a query.
   *
   * @param {string} name
   * @returns {{mac}|*}
   */
  quoteTableName(name) {

    if (/^\(.+\)$/.test(name) || name.indexOf('{{') !== -1) {
      return name;
    }
    if (name.indexOf('.') === -1) {
      return this.quoteSimpleTableName(name);
    }
    let parts = this.getTableNameParts(name);
    for (let key in parts) {
      parts[key] = this.quoteSimpleTableName(parts[key]);
    }

    return parts.join('.');
  }

  /**
   * Splits full table name into parts
   *
   * @param {string} name
   * @returns {*}
   */
  getTableNameParts(name) {
    return name.split('.');
  }


}

module.exports = Schema;
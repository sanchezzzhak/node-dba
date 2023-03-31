const Base = require('./base');
const QueryBuilder = require('./query-builder');
const helper = require('./helper');

const TYPE_SCHEMA = 'schema';

class Schema extends Base {
  /*** {Connection} @type */
  db;

  tableQuoteCharacter = '\'';
  columnQuoteCharacter = '"';

  #schemaNames = [];
  #tableNames = [];
  #tableMeteData = {};
  #serverVersion = null;
  /***
   * @property {QueryBuilder}
   */
  #builder;

  constructor(config = {}) {
    super(config);
    this.setOwnProperties(config);
  }

  getQueryBuilder() {
    if (!this.#builder) {
      return new QueryBuilder(this.db);
    }
    return this.#builder;
  }

  quoteValue(value) {
    if (typeof value == 'number') {
      return value;
    }
    if (/^\d[\d.]*$/.test(value)) {
      return value;
    }

    return '\'' +
        helper.addcslashes(value.replaceAll('\'', '\'\''), '\\000\n\r\\032') +
        '\'';
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

    if (!name) {
      return '';
    }
    if (/^\(.+\)$/i.test(name) || name && name.indexOf('{{') !== -1) {
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

  getTableSchema(name, refresh) {
    return this.getTableMetadata(name, TYPE_SCHEMA, refresh);
  }

  async getTableMetadata(name, type, refresh) {
    //todo add cache schema
    const rawName = this.getRawTableName(name);

    if (!helper.isset(this.#tableMeteData[rawName])) {
      await this.loadTableMetadataFromCache(rawName);
    }
    if (refresh || !(helper.isset(this.#tableMeteData[rawName]) &&
        helper.isset(this.#tableMeteData[rawName][type]))
    ) {

      if (this.#tableMeteData[rawName] === void 0) {
        this.#tableMeteData[rawName] = {};
      }
      if (this.#tableMeteData[rawName][type] === void 0) {
        this.#tableMeteData[rawName][type] = {};
      }
      this.#tableMeteData[rawName][type] = await this[`loadTable${helper.ucfirst(
          type)}`](rawName);
      await this.saveTableMetadataToCache(rawName);
    }

    return this.#tableMeteData[rawName][type];
  }

  async loadTableSchema(name) {
    throw new Error(
        'need implementation loadTableSchema() method for current class');
  }

  async loadTableMetadataFromCache(name) {

  }

  async saveTableMetadataToCache(name) {

  }

  getRawTableName(name) {
    if (helper.strncmp(name, '{{') !== false) {
      return name.replace(/[{]{2}(.*?)[}]{2}/, '$1').
      replace('%', this.db.tablePrefix);
    }
    return String(name);
  }

  getSchemaMetadata(schema, type, refresh) {
    const metadata = [];

    return metadata;
  }

}

module.exports = Schema;
const Base = require('./base');
const QueryBuilder = require('./query-builder');
const helper = require('./helper');

const TYPE_SCHEMA = 'schema';

class Schema extends Base {
  /*** {Connection} @type */
  db;

  tableQuoteCharacter = '\'';
  columnQuoteCharacter = '"';
  
  builder;
  columnSchema;
  schemaNames = {};
  tableNames = {};
  tableMeteData = {};
  serverVersion = null;
  typeMap = {};

  TYPE_PK = 'pk';
  TYPE_UPK = 'upk';
  TYPE_BIGPK = 'bigpk';
  TYPE_UBIGPK = 'ubigpk';
  TYPE_CHAR = 'char';
  TYPE_STRING = 'string';
  TYPE_TEXT = 'text';
  TYPE_TINYINT = 'tinyint';
  TYPE_SMALLINT = 'smallint';
  TYPE_INTEGER = 'integer';
  TYPE_BIGINT = 'bigint';
  TYPE_FLOAT = 'float';
  TYPE_DOUBLE = 'double';
  TYPE_DECIMAL = 'decimal';
  TYPE_DATETIME = 'datetime';
  TYPE_TIMESTAMP = 'timestamp';
  TYPE_TIME = 'time';
  TYPE_DATE = 'date';
  TYPE_BINARY = 'binary';
  TYPE_BOOLEAN = 'boolean';
  TYPE_MONEY = 'money';
  TYPE_JSON = 'json';


  /***
   * @property {QueryBuilder}
   */
  #builder;

  constructor(config = {}) {
    super(config);
    this.setOwnProperties(config);
  }

  getQueryBuilder() {
    if (!this.builder) {
      return new QueryBuilder(this.db);
    }
    return this.builder;
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

    if (!helper.isset(this.tableMeteData[rawName])) {
      await this.loadTableMetadataFromCache(rawName);
    }
    if (refresh || !(helper.isset(this.tableMeteData[rawName]) &&
        helper.isset(this.tableMeteData[rawName][type]))
    ) {

      if (this.tableMeteData[rawName] === void 0) {
        this.tableMeteData[rawName] = {};
      }
      if (this.tableMeteData[rawName][type] === void 0) {
        this.tableMeteData[rawName][type] = {};
      }
      this.tableMeteData[rawName][type] = await this[`loadTable${helper.ucfirst(
          type)}`](rawName);
      await this.saveTableMetadataToCache(rawName);
    }

    return this.tableMeteData[rawName][type];
  }

  async loadTableSchema(name) {
    throw new Error(
        `${helper.className(
            this)} need implementation loadTableSchema() method for current class`);
  }

  async loadTableMetadataFromCache(name) {

  }

  async saveTableMetadataToCache(name) {

  }

  async getTableNames(schema, refresh = false) {
    if ((this.tableNames && this.tableNames[schema]) || refresh) {
      this.tableNames[schema] = await this.findTableNames(schema);
    }
    return this.tableNames[schema];
  }

  /**
   * Returns all table names in the database.
   * This method should be overridden by child classes in order to support this feature
   * because the default implementation simply throws an exception.
   *
   * @param {string} schema
   * @returns {Promise<void>|Promise<Object>}
   */
  async findTableNames(schema = '') {
    throw new Error(
        `${helper.className(this)} does not support fetching all table names.`);
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

  /**
   *
   * @param {ColumnSchema} } column
   */
  getColumnJsType(column) {
    switch (column.type) {
      case this.TYPE_BIGINT:
        return 'bigint';
      case this.TYPE_TINYINT:
      case this.TYPE_SMALLINT:
      case this.TYPE_INTEGER:
        return column.unsigned ? 'string' : 'number';
      case this.TYPE_BOOLEAN:
        return 'boolean';
      case this.TYPE_FLOAT:
      case this.TYPE_DECIMAL:
        return 'number';
    }

    return 'string';
  }

}

module.exports = Schema;
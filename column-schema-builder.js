const Base = require('./base');
const Expression = require('./expression');
const Schema = require('./schema');

class ColumnSchemaBuilder {

  static CATEGORY_PK = 'pk';
  static CATEGORY_STRING = 'string';
  static CATEGORY_NUMERIC = 'numeric';
  static CATEGORY_TIME = 'time';
  static CATEGORY_OTHER = 'other';

  db;
  rules = {};
  categoryMap = {};

  constructor(type, length, db) {
    this.rules['type'] = type;
    this.rules['length'] = length;
    this.db = db;
    this.initCategoryMap();
  }

  /**
   * mapping of abstract column types (keys) to type categories (values).
   */
  initCategoryMap() {
    this.categoryMap[Schema.TYPE_PK] = ColumnSchemaBuilder.CATEGORY_PK;
    this.categoryMap[Schema.TYPE_UPK] = ColumnSchemaBuilder.CATEGORY_PK;
    this.categoryMap[Schema.TYPE_BIGPK] = ColumnSchemaBuilder.CATEGORY_PK;
    this.categoryMap[Schema.TYPE_UBIGPK] = ColumnSchemaBuilder.CATEGORY_PK;
    this.categoryMap[Schema.TYPE_CHAR] = ColumnSchemaBuilder.CATEGORY_STRING;
    this.categoryMap[Schema.TYPE_STRING] = ColumnSchemaBuilder.CATEGORY_STRING;
    this.categoryMap[Schema.TYPE_TEXT] = ColumnSchemaBuilder.CATEGORY_STRING;
    this.categoryMap[Schema.TYPE_TINYINT] = ColumnSchemaBuilder.CATEGORY_NUMERIC;
    this.categoryMap[Schema.TYPE_SMALLINT] = ColumnSchemaBuilder.CATEGORY_NUMERIC;
    this.categoryMap[Schema.TYPE_INTEGER] = ColumnSchemaBuilder.CATEGORY_NUMERIC;
    this.categoryMap[Schema.TYPE_BIGINT] = ColumnSchemaBuilder.CATEGORY_NUMERIC;
    this.categoryMap[Schema.TYPE_FLOAT] = ColumnSchemaBuilder.CATEGORY_NUMERIC;
    this.categoryMap[Schema.TYPE_DOUBLE] = ColumnSchemaBuilder.CATEGORY_NUMERIC;
    this.categoryMap[Schema.TYPE_DECIMAL] = ColumnSchemaBuilder.CATEGORY_NUMERIC;
    this.categoryMap[Schema.TYPE_DATETIME] = ColumnSchemaBuilder.CATEGORY_TIME;
    this.categoryMap[Schema.TYPE_TIMESTAMP] = ColumnSchemaBuilder.CATEGORY_TIME;
    this.categoryMap[Schema.TYPE_TIME] = ColumnSchemaBuilder.CATEGORY_TIME;
    this.categoryMap[Schema.TYPE_DATE] = ColumnSchemaBuilder.CATEGORY_TIME;
    this.categoryMap[Schema.TYPE_BINARY] = ColumnSchemaBuilder.CATEGORY_OTHER;
    this.categoryMap[Schema.TYPE_BOOLEAN] = ColumnSchemaBuilder.CATEGORY_NUMERIC;
    this.categoryMap[Schema.TYPE_MONEY] = ColumnSchemaBuilder.CATEGORY_NUMERIC;
  }

  getTypeCategory() {
    return this.categoryMap[this.rules.type] ?? null;
  }

  /**
   * Adds a `NOT NULL` constraint to the column.
   *
   * @returns {ColumnSchemaBuilder}
   */
  notNull() {
    this.rules['isNotNull'] = true;
    return this;
  }

  /**
   * Adds a `NULL` constraint to the column.
   *
   * @returns {ColumnSchemaBuilder}
   */
  null() {
    this.rules['isNotNull'] = false;
    return this;
  }

  /**
   * Adds a `UNIQUE` constraint to the column.
   *
   * @returns {ColumnSchemaBuilder}
   */
  unique() {
    this.rules['isUnique'] = true;
    return this;
  }

  /**
   * Marks column as unsigned.
   *
   * @returns {ColumnSchemaBuilder}
   */
  unsigned() {
    switch (this.rules['type']) {
      case Schema.TYPE_PK:
        this.rules['type'] = Schema.TYPE_UPK;
        break;
      case Schema.TYPE_BIGPK:
        this.rules['type'] = Schema.TYPE_UBIGPK;
        break;
    }
    this.rules['isUnsigned'] = true;
    return this;
  }

  /**
   * Specify additional SQL to be appended to column definition.
   * Position modifiers will be appended after column definition in databases that support them.
   *
   * @param {string} sql
   * @returns {ColumnSchemaBuilder}
   */
  append(sql) {
    this.rules['append'] = sql;
    return this;
  }

  /**
   * Sets a `CHECK` constraint for the column.
   *
   * @param check
   * @returns {ColumnSchemaBuilder}
   */
  check(check) {
    this.rules['check'] = check;
    return this;
  }

  /**
   * Specifies the comment for column.
   *
   * @param {string} comment
   * @returns {ColumnSchemaBuilder}
   */
  comment(comment) {
    this.rules['comment'] = comment;
    return this;
  }

  /**
   * Specify the default value for the column.
   *
   * @param value
   * @returns {ColumnSchemaBuilder}
   */
  defaultValue(value) {
    if (value === void 0 || value === null) {
      this.null();
    }
    this.rules['default'] = value;
    return this;
  }

  /**
   * Specify the default SQL expression for the column.
   *
   * @param value
   * @returns {ColumnSchemaBuilder}
   */
  defaultExpression(value) {
    return this.defaultValue(new Expression(value));
  }

  /**
   * Builds the length/precision part of the column.
   *
   * @returns {string}
   */
  buildLength() {
    if (helper.empty(this.rules['length'])) {
      return '';
    }
    if (Array.isArray(this.rules['length'])) {
      this.rules['length'] = this.rules['length'].join(',');
    }
    return `(${this.rules['length']})`;
  }

  buildUnsigned() {
    return '';
  }

  /**
   * Builds the not null constraint for the column.
   *
   * @returns {string}
   */
  buildNotNull() {
    const isNullNull = this.rules['isNotNull'] ?? null;
    if (isNullNull === true) {
      return ' NOT NULL';
    }
    if (isNullNull === false) {
      return ' NULL';
    }
    return '';
  }

  buildDefault() {
    let defaultValue = this.rules['default'];
    if (defaultValue === null) {
      defaultValue = this.rules['isNotNull'] === false ? 'NULL' : null;
    } else if (helper.instanceOf(defaultValue, Expression)) {
      defaultValue = this.db.getQueryBuilder.buildExpression(defaultValue);
    } else {
      switch (typeof defaultValue) {
        case 'bigint':
          defaultValue = defaultValue.toString();
          break;
        case 'number':
          defaultValue = String(defaultValue);
          break;
        case 'boolean':
          defaultValue = defaultValue ? 'TRUE' : 'FALSE';
          break;
        default:
          defaultValue = `'${defaultValue}'`;
          break;
      }
    }
    if (defaultValue === null) {
      return '';
    }

    return ` DEFAULT ${defaultValue}`;
  }

  buildUnique() {
    return (this.rules['isUnique'] ?? false) ? ' UNIQUE' : '';
  }

  /**
   * Builds the check constraint for the column.
   * @returns {string}
   */
  buildCheck() {
    return '';
  }

  /**
   * Builds the comment specification for the column.
   * @returns {string}
   */
  buildComment() {
    return (this.rules['check'] ?? false) !== null
        ? ` CHECK (${this.rules['check']})`
        : '';
  }

  /**
   * Builds the custom string that's appended to column definition.
   */
  buildAppend() {
    return (this.rules['append'] ?? false)
        ? ` ${this.rules['append']}`
        : '';
  }

  buildPos() {
    return '';
  }

  /**
   * Returns the complete column definition from input format.
   *
   * @param {string} format
   * @returns {{val, key: *, token}}
   */
  build(format) {
    const placeholders = {
      '{type}': this.rules.type,
      '{length}': this.buildLength(),
      '{unsigned}': this.buildUnsigned(),
      '{notnull}': this.buildNotNull(),
      '{unique}': this.buildUnique(),
      '{default}': this.buildDefault(),
      '{check}': this.buildCheck(),
      '{comment}': this.buildComment(),
      '{pos}': this.buildPos(),
      '{append}': this.buildAppend(),
    };

    return helper.strtr(format, placeholders);
  }

  toString() {
    let format = '{type}{length}{notnull}{unique}{default}{check}{comment}{append}';
    if (ColumnSchemaBuilder.CATEGORY_PK === this.getTypeCategory()) {
      format = '{type}{check}{comment}{append}';
    }
    return this.build(format);
  }

}

module.exports = ColumnSchemaBuilder;

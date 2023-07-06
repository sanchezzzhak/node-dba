const Base = require('./base');
const Expression = require('./expression');
const Schema = require('./schema');

class ColumnSchemaBuilder  {

  db;
  rules = {};

  constructor(type, length, db) {
    this.rules['type'] = type;
    this.rules['length'] = length;
    this.db = db;
  }

  /**
   * Adds a `NOT NULL` constraint to the column.
   *
   * @returns {ColumnSchemaBuilder}
   */
  notNull() {
    this.rules['isNotNull'] = true
    return this;
  }

  /**
   * Adds a `NULL` constraint to the column.
   *
   * @returns {ColumnSchemaBuilder}
   */
  null() {
    this.rules['isNotNull'] = false
    return this;
  }

  /**
   * Adds a `UNIQUE` constraint to the column.
   *
   * @returns {ColumnSchemaBuilder}
   */
  unique() {
    this.rules['isUnique'] = true
    return this;
  }

  /**
   * Marks column as unsigned.
   *
   * @returns {ColumnSchemaBuilder}
   */
  unsigned() {
    switch(this.rules['type']) {
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
      this.null()
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
    return this.defaultValue(new Expression(value))
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
    } else if(helper.instanceOf(defaultValue, Expression)) {
      defaultValue = this.db.getQueryBuilder.buildExpression(defaultValue)
    } else {
      switch (typeof defaultValue) {
        case 'bigint':
          defaultValue = defaultValue.toString();
          break;
        case 'number':
          defaultValue = String(defaultValue);
          break;
        case 'boolean':
          defaultValue = defaultValue ? 'TRUE' : 'FALSE'
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

  buildUnique(){
    return (this.rules['isUnique'] ?? false) ? ' UNIQUE': '';
  }

  build(format) {
    const placeholders = {
      '{type}' : this.rules.type,
      '{length}' : this.buildLength(),
      '{unsigned}' : this.buildUnsigned(),
      '{notnull}' : this.buildNotNull(),
      '{unique}' : this.buildUnique(),
      '{default}' : this.buildDefault(),
    };

    return helper.strtr(format, placeholders);
  }

  toString() {

  }

}
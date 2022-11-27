const Base = require('./base');
const helper = require('./helper');
const Expression = require('./expression');

// /** @type {string|array|object|Expression|Map} */
// #select;
// /** @type {string} */
// #selectOption;
// /** @type {boolean} */
// #distinct;
// /** @type {string|array} */
// from;
// /** @type {array} */
// #groupBy;
// /** @type {array} */
// #join;
// /** @type {string|array} */
// #having;
// #union;
// #params = {};
//
// #where;
// #limit;
// #offset;
// #orderBy;
// #indexBy;

class Query extends Base {

  rules = {};
  params = {};

  /*** getter object methods */


  getFrom() {
    return this.rules['from'] ?? '';
  }

  getSelect() {
    return this.rules['select'] ?? '';
  }

  getSelectOption() {
    return this.rules['selectOption'] ?? '';
  }

  getDistinct() {
    return Boolean(this.rules['distinct'] ?? false);
  }

  /**
   * @param {BaseConnection} db
   * @return {Command}
   */
  createCommand(db) {
    const {sql, params} = db.getQueryBuilder().build(this);
    return db.createCommand(sql, params);
  }

  /*** setter object methods */

  /**
   * Sets the value indicating whether to SELECT DISTINCT or not.
   * @param {boolean} stage
   * @return {Query}
   */
  distinct(stage = true) {
    this.rules['distinct'] = Boolean(stage);
    return this;
  }

  /**
   * @param {string|array|object|Expression|Map} columns
   * @param {string} option
   */
  select(columns, option) {
    this.rules['select'] = this.normalizeSelect(columns);
    this.rules['selectOption'] = option;
    return this;
  }

  normalizeSelect(columns) {

    if (helper.instanceOf(columns, Expression)) {
      columns = [columns];
    } else if (typeof columns === 'string') {
      columns = columns.trim().split(/\s*,\s*/);
    }

    let result = {};
    for (let key in columns) {
      let definition = columns[key];
      if (/^\d+$/.test(key) === false) {
        result[key] = definition;
        continue;
      }
      if (typeof definition === 'string') {
        let match = /^(.*?)(?:\s+as\s+|\s+)([\w.-]+)$/.exec(definition);
        if (
          match !== null &&
          /^\d+$/.test(match[2]) && match[2].indexOf('.') === -1
        ) {
          result[match[1]] = match[2];
          continue;
        }
        if (definition.indexOf('(') === -1) {
          result[definition] = definition;
          continue;
        }
      }
      result[key] = definition;
    }

    return result;
  }

  /**
   * Sets the LIMIT part of the query.
   * @param {number|Expression} limit
   */
  limit(limit) {
    this.rules['limit'] = limit;
    return this;
  }

  /**
   * Sets the OFFSET part of the query.
   * @param {number|Expression} offset
   */
  offset(offset) {
    this.rules['offset'] = offset;
  }

  /**
   * Sets the OFFSET part of the query.
   * @param {string|object|Expression} columns
   */
  orderBy(columns) {
    this.rules['orderBy'] = this.normalizeOrderBy(columns);
    return this;
  }

  normalizeOrderBy(columns) {
    if (helper.instanceOf(columns, Expression)) {
      return [columns];
    }
    if (typeof columns === 'object') {
      return columns;
    }
    if (typeof columns === 'string') {
      let result = {};
      let partColumns = columns.trim().split(/\s*,\s*/);
      for (let column of partColumns) {
        let match = /^(.*?)\s+(asc|desc)$/i.exec(column);
        if (match !== null) {
          result[match[1]] = match[2].indexOf('desc') !== -1 ? 'DESC' : 'ASC';
          continue;
        }
        result[column] = 'ASC';
      }
      return result;
    }
    throw new Error('Not support variable for `columns`');
  }

  indexBy(column) {
    this.rules['indexBy'] = column;
    return this;
  }

  adnWhere(condition) {
    if (this.rules['where'] === void 0) {
      this.rules['where'] = condition;
    } else {
      this.rules['where'] = ['and', this.rules['where'], condition];
    }
    return this;
  }

  orWhere(condition) {
    if (this.rules['where'] === void 0) {
      this.rules['where'] = condition;
    } else {
      this.rules['where'] = ['or', this.rules['where'], condition];
    }

    return this;
  }

  all() {
  }

  /**
   * @param {array|Expression|string} tables
   */
  from(tables) {

    if (helper.instanceOf(tables, Expression)) {
      tables = [tables];
    }

    if (typeof tables === 'string') {
      tables = tables.trim().split(/\s*,\s*/).filter(val => val !=='');
    }

    this.rules['from'] = tables;

    return this;
  }

  one(db) {
    return this.createCommand(db).queryOne();
  }

  scalar() {
  }

  column() {
  }

  count() {
  }

  sum() {
  }

  average() {
  }

  min() {
  }

  max() {
  }

  exists() {
  }

  /**
   *
   * @param {Query} query
   * @return {Query}
   */
  static createFrom(query) {
    return new this({
      rules: query.rules,
      params: query.params,
    });
  }

}

module.exports = Query;
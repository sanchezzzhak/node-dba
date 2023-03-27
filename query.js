const Base = require('./base');
const helper = require('./helper');
const Expression = require('./expression');

const
    RULE_SELECT = 'select',
    RULE_SELECT_OPTION = 'selectOption',
    RULE_WHERE = 'where',
    RULE_FROM = 'from',
    RULE_JOIN = 'join',
    RULE_UNION = 'union',
    RULE_HAVING = 'having',
    RULE_GROUP_BY = 'groupBy',
    RULE_ORDER_BY = 'orderBy',
    RULE_LIMIT = 'limit',
    RULE_PARAMS = 'params',
    RULE_OFFSET = 'offset',
    RULE_DISTINCT = 'distinct',
    RULE_INDEX_BY = 'indexBy';

class Query extends Base {

  rules = {};

  /*** getter object methods */


  getFrom() {
    return this.rules[RULE_FROM] ?? '';
  }

  /**
   * Gets the HAVING part of the query.
   * @returns {*|Object|Array|string}
   */
  getHaving() {
    return this.rules[RULE_HAVING] ?? '';
  }

  /**
   * Gets the GROUP BY part of the query
   * @returns {*|Object|Array|string}
   */
  getGroupBy() {
    return this.rules[RULE_GROUP_BY] ?? '';
  }

  /**
   * Gets the WHERE part of the query.
   * @returns {*|Object|Array|string}
   */
  getWhere() {
    return this.rules[RULE_WHERE] ?? '';
  }

  getParams() {
    return this.rules[RULE_PARAMS] ?? {};
  }

  getOrderBy() {
    return this.rules[RULE_ORDER_BY] ?? '';
  }

  getLimit() {
    return this.rules[RULE_LIMIT] ?? '';
  }

  getOffset() {
    return this.rules[RULE_OFFSET] ?? 0;
  }

  /**
   * Gets the SELECT part of the query.
   * @returns {*|Object|Array|string}
   */
  getSelect() {
    return this.rules[RULE_SELECT] ?? '';
  }

  getSelectOption() {
    return this.rules[RULE_SELECT_OPTION] ?? '';
  }

  getDistinct() {
    return Boolean(this.rules[RULE_DISTINCT] ?? false);
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
    this.rules[RULE_DISTINCT] = Boolean(stage);
    return this;
  }

  /**
   * Sets the SELECT part of the query.
   * @param {string|array|object|Expression|Map} columns
   * @param {string} option
   */
  select(columns, option = void 0) {
    this.rules[RULE_SELECT] = this.normalizeSelect(columns);
    if (option !== void 0) {
      this.rules[RULE_SELECT_OPTION] = option;
    }
    return this;
  }

  /**
   * Add more columns to the SELECT part of the query.
   * @param {string|array|object|Expression|Map} columns
   * @returns {Query}
   */
  addSelect(columns) {
    if (this.rules[RULE_SELECT] === void 0) {
      this.rules[RULE_SELECT] = this.normalizeSelect(columns);
    } else {
      this.rules[RULE_SELECT] = {
        ...this.rules[RULE_SELECT], ...this.normalizeSelect(columns),
      };
    }
    return this;
  }

  /**
   * Normalizes the SELECT columns passed to [[select()]] or [[addSelect()]]
   * @param {string|array|object|Expression|Map} columns
   * @returns {{}}
   */
  normalizeSelect(columns) {
    if (helper.instanceOf(columns, Expression)) {
      columns = [columns];
    } else if (typeof columns === 'string') {
      columns = helper.splitCommaString(columns);
    }

    let result = {};
    for (let key in columns) {
      let column = columns[key];
      if (helper.isNumber(key) === false) {
        result[key] = column;
        continue;
      }
      if (typeof column === 'string') {
        let match = /^(.*?)(?:\s+as\s+|\s+)([\w\-_\.]+)$/i.exec(column);
        if (match !== null && !helper.isNumber(match[2]) &&
            match[2].indexOf('.') === -1) {
          result[match[2]] = match[1];
          continue;
        }
        if (column.indexOf('(') === -1) {
          result[column] = column;
          continue;
        }
      }
      result[key] = column;
    }

    return result;
  }

  /**
   * Sets the parameters to be bound to the query.
   * @param params
   * @returns {Query}
   */
  params(params) {
    this.rules[RULE_PARAMS] = params;
    return this;
  }

  /**
   * Adds additional parameters to be bound to the query.
   * @param params
   */
  addParams(params) {
    if (helper.empty(params)) {
      return this;
    }
    if (helper.empty(this.rules[RULE_PARAMS])) {
      this.rules[RULE_PARAMS] = params;
    } else {
      this.rules[RULE_PARAMS] = {...this.rules[RULE_PARAMS], ...params};
    }
    return this;
  }

  /**
   * Sets the LIMIT part of the query.
   * @param {number|Expression} limit
   */
  limit(limit) {
    this.rules[RULE_LIMIT] = limit;
    return this;
  }

  /**
   * Sets the OFFSET part of the query.
   * @param {number|Expression} offset
   */
  offset(offset) {
    this.rules[RULE_OFFSET] = offset;
    return this;
  }

  /**
   * Sets the OFFSET part of the query.
   * @param {string|object|Expression} columns
   */
  orderBy(columns) {
    this.rules[RULE_ORDER_BY] = void 0;
    this.addOrderBy(columns);
    return this;
  }

  addOrderBy(columns) {
    if (!this.rules[RULE_ORDER_BY]) {
      this.rules[RULE_ORDER_BY] = [];
    }
    this.rules[RULE_ORDER_BY] = this.rules[RULE_ORDER_BY].concat(this.normalizeOrderBy(columns));
    return this;
  }

  /**
   * Adds additional ORDER BY columns to the query.
   * @param {string|object|Expression} columns
   * @returns {*}
   */
  normalizeOrderBy(columns) {
    if (helper.empty(columns)) {
      return [];
    }
    if (helper.instanceOf(columns, Expression) || typeof columns === 'object') {
      return [columns];
    }
    let result = [];
    if (typeof columns === 'string') {
      helper.splitCommaString(columns).forEach((column) => {
        let match = column.match(/^(.*?)\s+(asc|desc)/i);
        if (match) {
          result.push(match[1] + ' ' + match[2].toUpperCase());
          return;
        }
        result.push(column + ' ASC');
      });
    }

    if (Array.isArray(columns)) {
      return columns;
    }

    return result;
  }

  indexBy(column) {
    this.rules[RULE_INDEX_BY] = column;
    return this;
  }

  /**
   * Sets the HAVING part of the query.
   * @param {array|{}} condition
   * @param {{}} params
   * @returns {Query}
   */
  having(condition, params = {}) {
    this.rules[RULE_HAVING] = condition;
    this.addParams(params);
    return this;
  }

  /**
   * Check condition params for methods filter<Condition|Having>
   * @param {{}|array} condition
   * @returns {boolean|boolean}
   */
  hasCondition(condition) {
    return Array.isArray(condition) && condition.length !== 0
        || typeof condition === 'object' && !this.isEmpty(condition);
  }

  /**
   * Sets the HAVING part of the query.
   * @param condition
   * @returns {Query}
   */
  filterHaving(condition) {
    condition = this.filterCondition(condition);
    if (this.hasCondition(condition)) {
      this.having(condition);
    }
    return this;
  }

  orFilterHaving(condition) {
    condition = this.filterCondition(condition);
    if (this.hasCondition(condition)) {
      this.orHaving(condition);
    }
    return this;
  }

  andFilterHaving(condition) {
    condition = this.filterCondition(condition);
    if (this.hasCondition(condition)) {
      this.andHaving(condition);
    }
    return this;
  }

  andHaving(condition, params = {}) {
    this.#andRules(RULE_HAVING, condition, params);
  }

  orHaving(condition, params = {}) {
    this.#orRules(RULE_HAVING, condition, params);
  }

  #orRules(ruleType, condition, params = {}) {
    if (this.rules[ruleType] === void 0) {
      this.rules[ruleType] = condition;
    } else {
      this.rules[ruleType] = ['or', this.rules[ruleType], condition];
    }
    this.addParams(params);
  }

  #andRules(ruleType, condition, params = {}) {
    if (this.rules[ruleType] === void 0) {
      this.rules[ruleType] = condition;
    } else if (
        Array.isArray(this.rules[ruleType]) &&
        this.rules[ruleType][0] &&
        String(this.rules[ruleType][0]).toLowerCase() === 'and'
    ) {
      this.rules[ruleType].push(condition);
    } else {
      this.rules[ruleType] = ['and', this.rules[ruleType], condition];
    }
    this.addParams(params);
  }

  where(condition, params = {}) {
    this.rules[RULE_WHERE] = condition;
    this.addParams(params);
  }

  andWhere(condition, params = {}) {
    this.#andRules(RULE_WHERE, condition, params);
    return this;
  }

  orWhere(condition, params = {}) {
    this.#orRules(RULE_WHERE, condition, params);
    return this;
  }

  filterWhere(condition) {
    condition = this.filterCondition(condition);
    if (this.hasCondition(condition)) {
      this.where(condition);
    }
    return this;
  }

  orFilterWhere(condition) {
    condition = this.filterCondition(condition);
    if (this.hasCondition(condition)) {
      this.orWhere(condition);
    }
    return this;
  }

  andFilterWhere(condition) {
    condition = this.filterCondition(condition);
    if (this.hasCondition(condition)) {
      this.andWhere(condition);
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
      tables = helper.splitCommaString(tables);
    }
    this.rules[RULE_FROM] = tables;
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

  isEmpty(value) {
    return value === '' || value === void 0 ||
        (Array.isArray(value) && value.length === 0) ||
        value === null ||
        (typeof value === 'object' && Object.keys(value).length === 0) ||
        (typeof value === 'string' && value.trim() === '');
  }

  filterCondition(condition) {
    if (typeof condition !== 'object') {
      return condition;
    }

    if (condition[0] === void 0) {
      for (let key in condition) {
        if (this.isEmpty(condition[key])) {
          delete condition[key];
        }
      }
      return condition;
    }

    let operator = condition.shift();

    switch (operator.toUpperCase()) {
      case 'NOT':
      case 'AND':
      case 'OR':
        for (let key in condition) {
          const subCondition = this.filterCondition(condition[key]);
          if (this.isEmpty(subCondition)) {
            delete condition[key];
          } else {
            condition[key] = subCondition;
          }
        }
        if (this.isEmpty(condition)) {
          return [];
        }
        break;
      case 'BETWEEN':
      case 'NOT BETWEEN':
        if (condition[1] !== void 0 && condition[2] !== void 0) {
          if (this.isEmpty(condition[1]) || this.isEmpty(condition[2])) {
            return [];
          }
        }
        break;
      default:
        if (this.isEmpty(condition[1])) {
          return [];
        }
    }
    condition.unshift(operator);
    return condition;
  }

  normalizeGroupBy(columns) {
    if (helper.instanceOf(columns, Expression)) {
      columns = [columns];
    } else if (typeof columns === 'string') {
      columns = helper.splitCommaString(columns);
    }
    return columns;
  }

  /**
   * Sets the GROUP BY part of the query.
   * @param columns
   * @returns {Query}
   */
  groupBy(columns) {
    this.rules[RULE_GROUP_BY] = void 0;
    this.addGroupBy(columns);
    return this;
  }

  /**
   * Adds additional group-by columns to the existing ones.
   * @param columns
   * @returns {Query}
   */
  addGroupBy(columns) {
    if (!this.rules[RULE_GROUP_BY]) {
      this.rules[RULE_GROUP_BY] = this.normalizeGroupBy(columns);
    } else {
      this.rules[RULE_GROUP_BY] = this.rules[RULE_GROUP_BY].concat(
          this.normalizeGroupBy(columns));
    }
    return this;
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
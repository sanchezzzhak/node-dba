const helper = require('./helper');
const Expression = require('./expression');
const ExpressionBuilder = require('./expression-builder');
const Query = require('./query');
const Order = require('./sql/order');

const {
  SimpleCondition,
  HashCondition,
  ConjunctionCondition,
  ExistsCondition,
  NotCondition,
  BetweenCondition,
  InCondition,
  LikeCondition,
} = require('./conditions');

const {
  QueryExpressionBuilder,
  SimpleConditionBuilder,
  ConjunctionConditionBuilder,
  ExistsConditionBuilder,
  NotConditionBuilder,
  BetweenConditionBuilder,
  InConditionBuilder,
  LikeConditionBuilder,
  HashConditionBuilder,
} = require('./builders');

const PARAM_PREFIX = ':qp';
const COLUMN_SEPARATOR = ', ';

class QueryBuilder {
  /**
   * @type {Connection|PgConnection} - the database connection
   **/
  db;
  /**
   * @type {string} - the separator between different fragments of a SQL statement.
   */
  separator = ' ';

  conditionMap = {};
  expressionBuilderMap = {};

  /**
   * @param db {Connection|PgConnection}
   */
  constructor(db) {
    this.db = db;
    this.conditionMap = {...this.getDefaultConditionMap(), ...this.conditionMap};
    this.expressionBuilderMap = {...this.getDefaultExpressionBuilderMap(), ...this.expressionBuilderMap};
  }

  getDefaultExpressionBuilderMap() {
    return {
      'Query': QueryExpressionBuilder,
      'ConjunctionCondition': ConjunctionConditionBuilder,
      'ExistsCondition': ExistsConditionBuilder,
      'NotCondition': NotConditionBuilder,
      'SimpleCondition': SimpleConditionBuilder,
      'BetweenCondition': BetweenConditionBuilder,
      'InCondition': InConditionBuilder,
      'LikeCondition': LikeConditionBuilder,
      'HashCondition': HashConditionBuilder,
    };
  }

  getDefaultConditionMap() {
    return {
      'NOT': NotCondition,
      'AND': ConjunctionCondition,
      'OR': ConjunctionCondition,
      'BETWEEN': BetweenCondition,
      'NOT BETWEEN': BetweenCondition,
      'IN': InCondition,
      'NOT IN': InCondition,
      'EXISTS': ExistsCondition,
      'NOT EXISTS': ExistsCondition,
      'LIKE': LikeCondition,
      'NOT LIKE': LikeCondition,
      'OR LIKE': LikeCondition,
      'OR NOT LIKE': LikeCondition,
    };
  }

  /**
   * find builder for map or create ExpressionBuilder
   * @param expresion
   * @returns {ExpressionBuilder}
   */
  getExpressionBuilder(expresion) {
    let className = helper.className(expresion);
    if (this.expressionBuilderMap[className] !== void 0) {
      return new (this.expressionBuilderMap[className])(this);
    }
    return new ExpressionBuilder(this);
  }

  /**
   * @param {Expression|Object} expression
   * @param {{}} params
   * @returns {string}
   */
  buildExpression(expression, params = {}) {
    const builder = this.getExpressionBuilder(expression);
    return builder.build(expression, params);
  }

  /**
   * generate from part sql
   */
  buildFrom(tables, params) {
    if (helper.empty(tables)) {
      return '';
    }

    tables = this.quoteTableNames(tables, params);
    return 'FROM ' + tables.join(', ');
  }

  buildWhere(condition, params) {
    let where = this.buildCondition(condition, params);
    return (where === '' || where === void 0) ? '' : 'WHERE ' + where;
  }

  buildGroupBy(columns) {
    if (helper.empty(columns)) {
      return '';
    }
    let result = [];
    for (let key in columns) {
      let column = columns[key];
      if (column === void 0) {
        continue;
      }
      if (helper.instanceOf(column, Expression)) {
        let sqlPart = this.buildExpression(column);
        result.push(sqlPart);
      } else {
        result.push(this.db.quoteColumnName(column));
      }
    }

    return 'GROUP BY ' + result.join(COLUMN_SEPARATOR);
  }

  buildHaving(condition, params) {
    let having = this.buildCondition(condition, params);
    return (having === '' || having === void 0) ? '' : 'HAVING ' + having;
  }

  /**
   * Creates a condition based on column-value pairs.
   * @param {array|Object} condition
   * @param {{}} params
   * @returns {string|*}
   */
  buildCondition(condition, params) {
    if (helper.empty(condition)) {
      return '';
    }
    condition = this.createConditionFromArray(condition);
    if (helper.instanceOf(condition, Expression)) {
      return this.buildExpression(condition, params);
    }

    return String(condition);
  }

  createConditionFromArray(condition) {
    if (Array.isArray(condition) && helper.isset(condition[0])) {
      let operator = condition.shift().toUpperCase();
      if (helper.isset(this.conditionMap[operator])) {
        return new this.conditionMap[operator](operator, condition);
      }
      return new SimpleCondition(operator, condition);
    }

    return new HashCondition(condition);
  }

  buildOrderBy(columns) {
    if (helper.empty(columns)) {
      return '';
    }
    let orders = Order.from(columns);
    let results = [];
    for (let order of orders) {
      if (order.expression) {
        results.push(
            this.buildExpression(order.expression),
        );
        continue;
      }
      let column = this.db.quoteColumnName(order.column);
      results.push(column + ' ' + order.direction);
    }

    return results.length > 0
        ? 'ORDER BY ' + results.join(COLUMN_SEPARATOR)
        : '';
  }

  buildOrderByAndLimit(sql, orderBy, limit, offset) {
    orderBy = this.buildOrderBy(orderBy);
    if (orderBy !== '') {
      sql += this.separator + orderBy;
    }
    limit = this.buildLimit(limit, offset);
    if (limit !== '') {
      sql += this.separator + limit;
    }
    return sql;
  }

  /**
   * @param {number} limit
   * @param {number} offset
   * @return string the LIMIT and OFFSET clauses
   */
  buildLimit(limit, offset) {
    let result = [];
    if (this.hasLimit(limit)) {
      result.push('LIMIT '.limit);
    }
    if (this.hasOffset(offset)) {
      result.push('OFFSET '.offset);
    }

    return result.join(' ');
  }

  /**
   * Quotes table names passed.
   * @param {array} tables
   * @param {Object} params
   * @returns {*}
   * @todo added expresion.build
   */
  quoteTableNames(tables, params) {
    for (let i in tables) {
      let table = tables[i];

      if (helper.instanceOf(table, Expression)) {
        tables[i] = this.buildExpression(table, params);
        continue;
      }

      if (helper.instanceOf(table, Query)) {
        let {sql, params} = this.build(table, params);
        tables[i] = '(' + sql + ') ' + this.db.quoteTableName(i);
        continue;
      }

      if (typeof table === 'string' && /^\d+$/.test(i) === false && i !==
          table) {
        if (table.indexOf('(') === -1) {
          table = this.db.quoteTableName(table);
        }
        tables[i] = table + ' ' + this.db.quoteTableName(i);
        continue;
      }

      if (helper.strncmp(table, '(') === false) {
        let tableWithAlias = this.extractAlias(table);
        if (tableWithAlias) {
          tables[i] = this.db.quoteTableName(tableWithAlias[0]) + ' AS ' +
              this.db.quoteTableName(tableWithAlias[1]);
        } else {
          tables[i] = this.db.quoteTableName(table);
        }
      }

    }
    return tables;
  }

  /**
   * Extracts table alias if there is one or returns null
   *
   * @param {string} entity
   * @returns {array|null}
   */
  extractAlias(entity) {
    let regex = /^(.*?)(?:\s+as|)\s+([^ ]+)$/i;
    let match = regex.exec(entity);
    if (match) {
      return [match[1], match[2]];
    }
    return null;
  }

  /**
   * Generate select part sql
   *
   * @param columns
   * @param params
   * @param distinct
   * @param selectOption
   * @returns {string}
   */
  buildSelect(columns, params, distinct, selectOption = '') {
    let select = 'SELECT';
    if (distinct) {
      select += ' DISTINCT';
    }

    if (selectOption) {
      select += ' ' + selectOption;
    }

    if (helper.empty(columns)) {
      select += ' *';
    }

    let result = [];
    for (let key in columns) {
      let column = columns[key];
      if (column === void 0) {
        continue;
      }

      if (helper.instanceOf(column, Expression)) {
        let sqlPart = this.buildExpression(column, params);
        if (Number.isFinite(key)) {
          result.push(sqlPart);
        } else {
          result.push(sqlPart + ' AS ' + this.db.quoteColumnName(key));
        }
        continue;
      }
      if (helper.instanceOf(column, Query)) {
        let {sql, params} = this.build(column, params);
        result.push(`(${sql}) AS ` + this.db.quoteColumnName(key));
        continue;
      }
      if (/^\d+$/.test(key) === false && key !== column) {
        let sqlPart = String(column);
        if (column.indexOf('(') === -1) {
          sqlPart = this.db.quoteColumnName(column);
        }
        result.push(sqlPart + ' AS ' + this.db.quoteColumnName(key));
        continue;
      }

      if (column.indexOf('(') === -1) {
        let columnWithAlias = this.extractAlias(column);
        if (columnWithAlias !== null) {
          result.push(
              this.db.quoteColumnName(columnWithAlias[0]) + ' AS ' +
              this.db.quoteColumnName(columnWithAlias[1]),
          );
          continue;
        }
        result.push(this.db.quoteColumnName(column));
      }
    }

    return (select + ' ' + result.join(', ')).trim();
  }

  /***
   * Generates a SELECT SQL statement from a {Query} object.
   *
   * @param {Query} query
   * @param {object} parameters
   */
  build(query, parameters = {}) {
    let params = helper.merge(parameters ?? {}, query.getParams());
    let clauses = [];

    clauses.push(
        this.buildSelect(
            query.getSelect(),
            params,
            query.getDistinct(),
            query.getSelectOption(),
        ),
        this.buildFrom(query.getFrom(), params),
        //buildJoin
        this.buildWhere(query.getWhere(), params),
        this.buildGroupBy(query.getGroupBy()),
        this.buildHaving(query.getHaving(), params),
    );
    clauses = clauses.filter(value => value !== '');
    let sql = clauses.join(this.separator);

    sql = this.buildOrderByAndLimit(sql,
        query.getOrderBy(),
        query.getLimit(),
        query.getOffset(),
    );

    return {sql, params};
  }

  /**
   * Helper method to add value to params array using [[PARAM_PREFIX]]
   * return placeholder name
   *
   * @param value
   * @param {{}} params - passed by reference
   * @returns {string}
   */
  bindParam(value, params = {}) {
    let placeholderName = PARAM_PREFIX + helper.count(params);
    params[placeholderName] = value;
    return placeholderName;
  }

  /**
   * Checks to see if the given limit is effective.
   * @param limit
   * @returns {boolean}
   */
  hasLimit(limit) {
    return helper.instanceOf(limit, Expression) || helper.isNumber(limit);
  }

  /**
   * Checks to see if the given offset is effective.
   * @param offset
   * @returns {boolean}
   */
  hasOffset(offset) {
    return helper.instanceOf(offset, Expression) ||
        (helper.isNumber(offset) && String(offset) !== '0');
  }

  update(table, columns, condition, params) {
    [sets, params] = this.#prepareUpdateSets(table, columns, params);
    const sql = `UPDATE ${this.db.getTableSchema(table)} SET ${sets.join(
        sets)}`;
    const where = this.buildWhere(condition, params);
    return where === '' ? sql : `${sql} ${where}`;
  }

  #prepareUpdateSets(table, columns, params) {
    const sets = [];
    const tableSchema = this.db.getTableSchema(table);
    const columnSchemas = tableSchema !== null ? tableSchema.columns : {};

    for (let [column, value] of Object.entries(columns)) {
      let placeholder;
      value = helper.isset(columnSchemas[column]) ? columnSchemas[column].dbTypecast(value) : value;
      if (helper.instanceOf(value, Expression)) {
        placeholder = this.buildExpression(value, params);
      } else {
        placeholder = this.bindParam(value, params);
      }
      sets.push(`${this.db.quoteColumnName(column)}=${placeholder}`)
    }
    return {sets, params};
  }

}

module.exports = QueryBuilder;
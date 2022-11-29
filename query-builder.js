const helper = require('./helper');
const Expression = require('./expression');
const ExpressionBuilder = require('./expression-builder');
const Query = require('./query');
const SimpleCondition = require('./conditions/simple-condition');
const HashCondition = require('./conditions/simple-condition');
const ConjunctionCondition = require('./conditions/conjunction-condition');
const ExistsCondition = require('./conditions/exists-condition');

const ConjunctionConditionBuilder = require('./builders/conjunction-condition-builder');
const ExistsConditionBuilder = require('./builders/exists-condition-builder');

class QueryBuilder {
  /*** @type db {Connection|PgConnection} - the database connection */
  db;
  /*** @type separator {string} - the separator between different fragments of a SQL statement. */
  separator = ' ';

  conditionMap = {};
  expressionBuilderMap = {}

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
      'ConjunctionCondition': ConjunctionConditionBuilder,
      'ExistsCondition': ExistsConditionBuilder
    }
  }

  getDefaultConditionMap(){
    return {
      'AND': ConjunctionCondition,
      'OR': ConjunctionCondition,
      'NOT EXISTS': ExistsCondition,
      'EXISTS': ExistsCondition,
    }
  }

  /**
   * find builder for map or create ExpressionBuilder
   * @param expresion
   * @returns {ExpressionBuilder}
   */
  getExpressionBuilder(expresion) {
    let className = helper.className(expresion);
    if (this.expressionBuilderMap[className] !== void 0){
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
      return (helper.isset(this.conditionMap[operator])
        ? new this.conditionMap[operator](operator, condition)
        : new SimpleCondition(operator, condition));
    }

    return new HashCondition(condition);
  }

  /**
   * Quotes table names passed.
   * @param {array} tables
   * @param params
   * @returns {*}
   * @todo added expresion.build
   */
  quoteTableNames(tables, params) {
    for (let i in tables) {
      let table = tables[i];


      if (helper.instanceOf(table, Query)) {
        let {sql, params} = this.build(table, params)
        tables[i] = '(' + sql + ') ' + this.db.quoteTableName(i);
        continue;
      }

      if (typeof table === 'string' && /^\d+$/.test(i) === false && i !== table) {
        if (table.indexOf('(') === -1) {
          table = this.db.quoteTableName(table);
        }
        tables[i] = table + ' ' + this.db.quoteTableName(i);
        continue;
      }

      if (table.indexOf('(') === -1) {
        let tableWithAlias = this.extractAlias(table);
        if (tableWithAlias !== null) {
          tables[i] = this.db.quoteTableName(tableWithAlias[1]) + ' ' + this.db.quoteTableName(tableWithAlias[1]);
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
   * @param table
   * @returns {array|null}
   */
  extractAlias(table) {
    let matches = [...table.matchAll('/^(.*?)(?:\s+as|)\s+([^ ]+)$/i')];
    if (matches.length) {
      return matches;
    }
    return null;
  }

  /**
   * generate select part sql
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
        let match = /^(.*?)(?:i:\s+as\s+| +)([\w.-]+)$/ig.exec(column);
        if (match !== null) {
          result.push(
            this.db.quoteColumnName(match[1]) + ' AS ' +
            this.db.quoteColumnName(match[2]),
          );
          continue;
        }
        result.push(this.db.quoteColumnName(column));
      }
    }

    return select + ' ' + result.join(', ');
  }

  /***
   * Generates a SELECT SQL statement from a {Query} object.
   * @param {Query} query
   * @param {object} parameters
   */
  build(query, parameters = {}) {
    let params = helper.empty(parameters)
      ? query.getParams()
      : helper.merge(parameters, query.getParams());

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
    );
    clauses = clauses.filter(value => value !== '');
    let sql = clauses.join(this.separator);
    return {sql, params};
  }

}

module.exports = QueryBuilder;
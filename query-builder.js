const helper = require('./helper');
const Expression = require('./expression');
const ExpressionBuilder = require('./expression-builder');
const Query = require('./query');

class QueryBuilder {
  /*** @type db {Connection|PgConnection} - the database connection */
  db;
  /*** @type separator {string} - the separator between different fragments of a SQL statement. */
  separator = ' ';

  conditionBuilders = [];
  conditionObjects = [];
  expressionBuilders = [];

  /**
   *
   * @param db {Connection|PgConnection}
   */
  constructor(db) {
    this.db = db;
  }

  getExpressionBuilder(expresion) {
    return ExpressionBuilder(this);
  }

  buildExpression(expression, params = {}) {
    const builder = this.getExpressionBuilder(expression);
    return builder.build(expression, params);
  }

  /**
   * generate from part sql
   */
  buildFrom(tables, params){
    if (helper.empty(tables)) {
      return '';
    }

    tables = this.quoteTableNames(tables, params);
    return 'FROM ' + tables.join(', ');
  }

  /**
   * Quotes table names passed.
   * @param {array} tables
   * @param params
   * @returns {*}
   * @todo added expresion.build
   */
  quoteTableNames(tables, params) {
    for(let i in tables) {
      let table = tables[i];



      if (helper.instanceOf(table, Query)){
        let {sql, params} = this.build(table, params)
        tables[i]= '(' + sql + ') ' + this.db.quoteTableName(i);
        continue;
      }

      if (typeof table === 'string' && /^\d+$/.test(i) === false && i !== table ) {
        if (table.indexOf('(') === -1){
          table =  this.db.quoteTableName(table);
        }
        tables[i]= table + ' ' + this.db.quoteTableName(i);
        continue;
      }

      if (table.indexOf('(') === -1){
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
      ? query.params
      : helper.merge(parameters, query.params);

    let clauses = [];

    clauses.push(
      this.buildSelect(
        query.getSelect(),
        params,
        query.getDistinct(),
        query.getSelectOption(),
      ),
      this.buildFrom(query.getFrom(), params),

    );
    clauses = clauses.filter(value => value !== '');
    let sql = clauses.join(this.separator);
    return {sql, params};
  }

}

module.exports = QueryBuilder;
const ExpressionBuilder = require("../expression-builder");
const Expression = require("../expression");
const helper = require("../helper");

class ConjunctionConditionBuilder extends ExpressionBuilder
{
  /**
   * Builds expressions, that are stored in condition
   * @param {ConjunctionCondition|Expression} condition
   * @param {{}} params
   */
  buildExpressionsFrom(condition, params) {
    let result = [];

    (condition.expressions ?? []).forEach(condition => {
      if(Array.isArray(condition)) {
        condition = this.queryBuilder.buildCondition(condition, params);
      }
      if (helper.instanceOf(condition, Expression)) {
        condition = this.queryBuilder.buildExpression(condition, params);
      }
      if (condition !== '') {
        result.push(condition);
      }
    })

    return result;
  }

  /**
   * @param {ConjunctionCondition|Expression} expression
   * @param {{}} params
   * @returns {string|*}
   */
  build(expression, params) {
    let parts = this.buildExpressionsFrom(expression, params);
    if (helper.empty(params)) {
      return '';
    }
    if (parts.length === 1) {
      return parts[0];
    }

    return '(' + parts.join(`) ${expression.operator} (`) + ')';
  }
}

module.exports = ConjunctionConditionBuilder;
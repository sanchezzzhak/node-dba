
const Expression = require('../expression');

/**
 * todo added later
 */
class BetweenCondition extends Expression
{
  #operator;
  #column;
  #intervalStart;
  #intervalEnd;


  constructor(operator, operands) {
    super();
  }

  /**
   * Get operator to use (e.g. `BETWEEN` or `NOT BETWEEN`)
   *
   * @returns {string}
   */
  get operator(){
    return this.#operator;
  }

  /**
   * the column name to the left of [[operator]]
   *
   * @returns {*}
   */
  get column(){
    return this.#column;
  }


}
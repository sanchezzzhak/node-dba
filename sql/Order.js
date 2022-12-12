const helper = require("../helper");


class Order {
  expression;
  column;
  direction;

  constructor(column, direction, expression) {
    this.column = column;
    this.direction = direction;
    this.expression = expression;
  }

  static from(columns) {
    // expresion
    if (helper.instanceOf(columns, Expression)) {
      return [new Order(null, null, columns)];
    }
    const results = [];
    // create from string
    if (typeof columns === 'string') {
      columns = helper.splitCommaString(columns);
      for (let column of columns) {
        let match = /^(.*?)\s+((?:a|de)sc)$/i.exec(column);
        if (match !== null) {
          results.push(new Order(
            match[1],
            String(match[2]).toLowerCase().indexOf('desc') !== -1 ? 'DESC' : 'ASC',
            null
          ))
        } else {
          results.push(new Order(column, 'ASC', null))
        }
      }
    }
    // hash or array
    if (typeof columns === 'object') {

    }



    return results;
  }


}
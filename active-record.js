const helper = require('./helper');
const Base = require('./base');
const {DBA, Expression} = require('./index');

const lowerCaseTable = function(id, separator = '_') {
  return helper.words(id).join(separator).toLowerCase();
};

class ActiveRecord extends Base {

  /**
   * Get db connection
   * @return {*}
   */
  static getDb(overwriteConfig = null) {
    return DBA.instance(this.getDbName(), overwriteConfig);
  }

  /**
   * Get database connection name string
   * @return {String}
   */
  static getDbName() {
    throw new Error(
        `need implementation getDbName() method for current class "${helper.className(
            this)}"`);
  }

  /**
   * Get table name for active record model
   * @return {String}
   */
  static tableName() {
    return lowerCaseTable(
        helper.className(this),
    );
  }

  refresh() {

  }

  static async updateAll(attributes, condition, params = {}) {
    return await this.getDb().createCommand().update(this.tableName(), attributes, params)
  }

  static async updateAllCounters(counters, condition, params = {}) {
    const bindParams = {};
    let inc = 0;
    for (let [key, value] of Object.entries(counters)) {
      const bindParam = {};
      bindParam[`:bp${inc}`] = value;
      bindParams[key] = new Expression(`[[${name}]]+:bp${inc}`, bindParam);
      inc++;
    }
    return await this.getDb().createCommand().update(this.tableName(), bindParams, condition, params)

  }

  /**
   * Updates the whole table using the provided counter changes and conditions.
   * @param {Object|String} condition
   * @param {Object} params
   * @return {number}
   */
  static async deleteAll(condition, params = {}) {
    return await this.getDb().createCommand().delete(this.tableName(), condition, params)
  }

  /**
   * Create find ActiveQuery
   * @return {ActiveQuery}
   */
  static find() {
    return this.getDb().getActiveQuery();
  }

  hasOne(model, link) {
    return this.#createRelationQuery(model, link, false);
  }

  hasMany(model, link) {
    return this.#createRelationQuery(model, link, true);
  }

  #createRelationQuery(className, link, multiple) {
    let query = (className).find();
    query.primatyModel = this;
    query.link = link;
    query.multiple = multiple;
    return query;
  }

}

module.exports = ActiveRecord;
import * as helper from './helper.js';
import Expression from './expression.js';
import DBA from './dba.js';
import Base from './base.js';


const lowerCaseTable = (id, separator = '_') => {
  return helper.words(id).join(separator).toLowerCase();
};

export default class ActiveRecord extends Base {

  /**
   * Get db connection
   * @return {*}
   */
  static getDb(overwriteConfig = null) {
    return DBA.dialect(this.getDbName(), overwriteConfig);
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

  /**
   * reload data from db
   */
  refresh() {

  }

  /**
   * Update rows or attributes by condition + params
   * @param attributes
   * @param condition
   * @param params
   * @return {Promise<*>}
   */
  static async updateAll(attributes, condition, params = {}) {
    return await this.getDb().createCommand().update(this.tableName(), attributes, params)
  }

  /**
   * Update counters increments
   * @param counters
   * @param condition
   * @param params
   * @return {Promise<*>}
   */
  static async updateCounters(counters, condition, params = {}) {
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
   * Delete rows by condition + params
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

  /**
   * Relation has one pattern
   * @param model
   * @param link
   * @return {*}
   */
  hasOne(model, link) {
    return this.#createRelationQuery(model, link, false);
  }

  /**
   * Relation has many pattern
   * @param model
   * @param link
   * @return {*}
   */
  hasMany(model, link) {
    return this.#createRelationQuery(model, link, true);
  }

  /**
   * Inline method create relation link
   * @param className
   * @param link
   * @param multiple
   * @return {*}
   */
  #createRelationQuery(className, link, multiple) {
    const query = (className).find();
    query.primatyModel = this;
    query.link = link;
    query.multiple = multiple;
    return query;
  }

}

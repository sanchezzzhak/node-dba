const BaseSchema = require('../schema');
const ColumnSchema = require('./column-schema');

class Schema extends BaseSchema {
  tableQuoteCharacter = '"';
  defaultSchema = 'public';
  columnSchema = ColumnSchema;

  constructor(config) {
    super(config);
    this.setOwnProperties(config);
  }

  async loadTableSchema(name) {
    const table = new TableSchema();

    return null;
  }

  /**
   * @returns {Promise<*>}
   */
  async findSchemaNames() {
    const sql = `SELECT "ns"."nspname"
      FROM "pg_namespace" AS "ns"
      WHERE "ns"."nspname" != 'information_schema' AND "ns"."nspname" NOT LIKE 'pg_%'
      ORDER BY "ns"."nspname" ASC
    `;
    return this.db.createCommand(sql).queryColumn();
  }

  /**
   * @param {string} schema
   * @returns {Promise<*>}
   */
  async findTableNames(schema = '') {
    let schemaName = String(schema);
    if (schema === '') {
      schemaName = String(this.defaultSchema);
    }
    const sql = `SELECT c.relname AS table_name
    FROM pg_class c
    INNER JOIN pg_namespace ns ON ns.oid = c.relnamespace
    WHERE ns.nspname = :schemaName AND c.relkind IN ('r','v','m','f', 'p')
    ORDER BY c.relname
    `;

    return this.db.createCommand(sql, {
      ':schemaName': schemaName,
    }).queryColumn();

  }

}

module.exports = Schema;
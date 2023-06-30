const BaseSchema = require('../schema');
const ColumnSchema = require('./column-schema');
const helper = require('./../helper');
const TableSchema = require('./../table-schema');

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
    this.resolveTableNames(table, name);
    if (await this.findColumns(table)) {
      this.findConstraints(table);
      return table;
    }
    return null;
  }

  async findColumns(table) {
    let tableName = this.db.quoteValue(table.name)
    let schemaName = this.db.quoteValue(table.schemaName)
    let orIdentity = ''
    if (this.db.serverVersion && helper.versionCompare(this.db.serverVersion, '12.0') >= 0) {
      orIdentity = `OR attidentity != ''`;
    }
    let sql = `SELECT
    d.nspname AS table_schema,
    c.relname AS table_name,
    a.attname AS column_name,
    COALESCE(td.typname, tb.typname, t.typname) AS data_type,
    COALESCE(td.typtype, tb.typtype, t.typtype) AS type_type,
    (SELECT nspname FROM pg_namespace WHERE oid = COALESCE(td.typnamespace, tb.typnamespace, t.typnamespace)) AS type_scheme,
    a.attlen AS character_maximum_length,
    pg_catalog.col_description(c.oid, a.attnum) AS column_comment,
    a.atttypmod AS modifier,
    a.attnotnull = false AS is_nullable,
    CAST(pg_get_expr(ad.adbin, ad.adrelid) AS varchar) AS column_default,
    coalesce(pg_get_expr(ad.adbin, ad.adrelid) ~ 'nextval',false) ${orIdentity} AS is_autoinc,
    pg_get_serial_sequence(quote_ident(d.nspname) || '.' || quote_ident(c.relname), a.attname) AS sequence_name,
    CASE WHEN COALESCE(td.typtype, tb.typtype, t.typtype) = 'e'::char
        THEN array_to_string((SELECT array_agg(enumlabel) FROM pg_enum WHERE enumtypid = COALESCE(td.oid, tb.oid, a.atttypid))::varchar[], ',')
        ELSE NULL
    END AS enum_values,
    CASE atttypid
         WHEN 21 /*int2*/ THEN 16
         WHEN 23 /*int4*/ THEN 32
         WHEN 20 /*int8*/ THEN 64
         WHEN 1700 /*numeric*/ THEN
              CASE WHEN atttypmod = -1
               THEN null
               ELSE ((atttypmod - 4) >> 16) & 65535
               END
         WHEN 700 /*float4*/ THEN 24 /*FLT_MANT_DIG*/
         WHEN 701 /*float8*/ THEN 53 /*DBL_MANT_DIG*/
         ELSE null
      END   AS numeric_precision,
      CASE
        WHEN atttypid IN (21, 23, 20) THEN 0
        WHEN atttypid IN (1700) THEN
        CASE
            WHEN atttypmod = -1 THEN null
            ELSE (atttypmod - 4) & 65535
        END
           ELSE null
      END AS numeric_scale,
    CAST(
             information_schema._pg_char_max_length(information_schema._pg_truetypid(a, t), information_schema._pg_truetypmod(a, t))
             AS numeric
    ) AS size,
    a.attnum = any (ct.conkey) as is_pkey,
    COALESCE(NULLIF(a.attndims, 0), NULLIF(t.typndims, 0), (t.typcategory='A')::int) AS dimension
FROM
    pg_class c
    LEFT JOIN pg_attribute a ON a.attrelid = c.oid
    LEFT JOIN pg_attrdef ad ON a.attrelid = ad.adrelid AND a.attnum = ad.adnum
    LEFT JOIN pg_type t ON a.atttypid = t.oid
    LEFT JOIN pg_type tb ON (a.attndims > 0 OR t.typcategory='A') AND t.typelem > 0 AND t.typelem = tb.oid OR t.typbasetype > 0 AND t.typbasetype = tb.oid
    LEFT JOIN pg_type td ON t.typndims > 0 AND t.typbasetype > 0 AND tb.typelem = td.oid
    LEFT JOIN pg_namespace d ON d.oid = c.relnamespace
    LEFT JOIN pg_constraint ct ON ct.conrelid = c.oid AND ct.contype = 'p'
WHERE
    a.attnum > 0 AND t.typname != '' AND NOT a.attisdropped
    AND c.relname = ${tableName}
    AND d.nspname = ${schemaName}
ORDER BY
    a.attnum;`;
    let columns = await this.db.createCommand(sql).queryAll();
    if (helper.empty(columns)) {
      return false;
    }
    console.log({columns})
  }

  /**
   * Resolves the table name and schema name (if any).
   * @param table
   * @param name
   */
  resolveTableNames(table, name) {
    const parts = name.replace('"', '').split('.');
    if (helper.isset(parts[1])) {
      table.schemaName = parts[0];
      table.name = parts[1];
    } else {
      table.schemaName = String(this.defaultSchema);
      table.name = parts[0];
    }

    table.fullName = table.schemaName !== this.defaultSchema
        ? `${table.schemaName}.${table.name}`
        : table.name;
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
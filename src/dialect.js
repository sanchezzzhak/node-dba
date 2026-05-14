import DRIVERS from './consts/drivers.js'
import PostgresDialect from './pg/postgres-dialect.js';
import MysqlDialect from './mysql/mysql-dialect.js';
import ClickHouseDialect from './clickhouse/clickhouse-dialect.js';


export default class Dialect {
	static create(driverType, connection) {
		if (driverType === DRIVERS.POSTGRES) return new PostgresDialect(connection);
		if (driverType === DRIVERS.MYSQL) return new MysqlDialect(connection);
		if (driverType === DRIVERS.CLICKHOUSE) return new ClickHouseDialect(connection);
		throw new Error('Unsupported dialect');
	}
}


import Base from "./base.js";
import Expression from "./expression.js";
import * as helper from "./helper.js";


export default class BaseCommand extends Base {
	db;
	params = {};
	sql;

	getRawSql() {
		if (helper.empty(this.params)) {
			return this.sql;
		}

		let params = {};
		for (let key in this.params) {
			let name = key;
			if (/^\d+$/.test(key) === false && helper.strncmp(name, ':', 1)) {
				name = ':' + key;
			}
			let value = this.params[key];
			if (typeof value === 'string' || helper.instanceOf(value, Expression)) {
				params[name] = this.db.quoteValue(String(value));
				continue;
			}
			if (typeof value === 'boolean') {
				params[name] = value ? 'TRUE' : 'FALSE';
				continue;
			}
			if (value === null) {
				params[name] = 'NULL';
				continue;
			}
			if (typeof value == 'number') {
				params[name] = value;
			} else if (/^\d[\d.]*$/.test(value)) {
				params[name] = value;
			}
		}

		if (!helper.empty(params)) {
			return helper.replaceCallback(/(:\w+)/g, (matches) => {
				let match = matches[1];
				return params[match] ?? match;
			}, String(this.sql));
		}

		return this.sql;
	}

	bindValues(params) {
		if (params === void 0) {
			return this;
		}

		for (let key in params) {
			this.params[key] = params[key];
		}

		return this;
	}


}
import DRIVERS from './consts/drivers.js';
import Dialect from './dialect.js';
import {readdirSync} from 'node:fs';
import * as path from "node:path";
import { pathToFileURL } from 'node:url';

export default class DBA {
	static configMap = {};
	static dialectMap = {};

	/**
	 * get support drivers
	 * @return {(string)[]}
	 */
	static getSupportDrives() {
		return Object.values(DRIVERS);
	}

	/**
	 * get db connection
	 * @param {string} configName
	 * @param {{}} overwriteConfig
	 * @returns {*}
	 */
	static dialect(configName = 'db', overwriteConfig = {}) {
		if (DBA.dialectMap[configName] !== void 0) {
			return DBA.dialectMap[configName];
		}
		const config = DBA.configMap[configName];
		const {driver} = config;
		if (!driver) {
			throw new Error(`Not set section driver for config ${configName}`);
		}
		if (!DBA.getSupportDrives().includes(driver)) {
			throw new Error(`Unknown ${driver} driver`);
		}

		if (!config) {
			throw new Error(`Config "${configName}" not found or not load`);
		}

		try {
			DBA.dialectMap[configName] = Dialect.create(driver, {...config, ...overwriteConfig});
		} catch (err) {
			throw err;
		}
		return DBA.dialectMap[configName] ?? {};
	}

	/**
	 * load config for json or js files
	 * @param dirPath
	 */
	 static async loadConfigsForDir(dirPath) {
		const files = readdirSync(dirPath, { withFileTypes: true })
			.filter(file => file.isFile() && /\.(js|json)$/.test(file.name));

		await Promise.all(files.map(async (file) => {
			const name = path.parse(file.name).name;
			const fullPath = path.resolve(dirPath, file.name);
			const fileUrl = pathToFileURL(fullPath).href;
			const module = await import(fileUrl);
			DBA.configMap[name] = module.default ?? module;
		}));
	}

}
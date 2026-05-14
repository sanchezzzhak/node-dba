import EventEmitter2 from "eventemitter2";

export default class Base extends EventEmitter2 {

	constructor(config) {
		super({});
		this.setOwnProperties(config)
	}

	/**
	 * DI set own properties
	 * @param {{}} config
	 */
	setOwnProperties(config = {}) {
		if (!config) {
			return;
		}

		for (let [key, value] of Object.entries(config)) {
			if (this.hasOwnProperty(key)) {
				this[key] = value;
			}
		}
	}
}

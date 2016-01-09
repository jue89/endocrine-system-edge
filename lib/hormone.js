"use strict";


// Hormone class is exteneded by HormoneSink and HormoneSource class
// The specialised classes just houses the constructor. The class methods are
// implemented here.

class Hormone {

	get isFresh() {

		let freshness = this._definition.data.freshness;
		if( ! freshness ) return true;

		let now = Math.floor( Date.now() / 1000 );

		return (now - this._timestamp - freshness) <= 0;

	}

	get payload() { return this._payload; }

	get data() { return this._data; }

	get definition() { return this._definition.data; }

}

module.exports = Hormone;

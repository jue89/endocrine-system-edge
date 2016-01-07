"use strict";


class Hormone {

	get isFresh() {

		let freshness = this._definition.data.freshness;
		if( ! freshness ) return true;

		let now = Math.floor( Date.now() / 1000 );

		return (now - this._timestamp - freshness) <= 0;

	}

}

module.exports = Hormone;

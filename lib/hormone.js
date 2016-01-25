"use strict";

let vm = require( 'vm' );

let time = require( './time.js' );


// Hormone class is exteneded by HormoneSink and HormoneSource class
// The specialised classes just houses the constructor. The class methods are
// implemented here.

class Hormone {

	get freshness() {

		let reqFreshness = this._definition.data.freshness;
		if( ! reqFreshness ) return true;

		let now = time.now();

		return ( this._timestamp - now + reqFreshness );

	}

	get isFresh() {

		let freshness = this.freshness;

		// If freshness is boolean, the number of seconds the hormone will remain
		// fresh cannot be obtained
		if( typeof freshness == 'boolean') return freshness;

		return ( freshness >= 0 );

	}

	get error() {

		let def = this._definition.data;

		// If we do not find a check script, just return 0 -> no error
		if( ! def.check ) return 0;

		// If the error hasn't been calculated before, run check script
		if( ! this._error ) {

			// Create a new vm
			let check = new vm.Script( def.check );

			// Create new context
			let sandbox = { err: 0 };
			let data = this._data;
			for( let d in data ) {
				// Read data from hormone
				sandbox[ d ] = data[ d ];
			}
			vm.createContext( sandbox );

			// Run script
			check.runInContext( sandbox );

			// Store error in instance;
			if( sandbox.err !== undefined ) this._error = parseFloat( sandbox.err );

		}

		return this._error;

	}

	get payload() { return this._payload; }

	get data() { return this._data; }

	get definition() { return this._definition; }

	get timestamp() { return this._timestamp; }

}

module.exports = Hormone;

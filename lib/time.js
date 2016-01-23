"use strict";

let ntp = require('ntp-client');


// This is a helper class for all time related things.
// The encapsulation allows the unit testing system to mock this class and fake
// the current time.

class Time {

	static now() {
		return Math.floor( Date.now() / 1000 );
	}

	static ntp( server, port ) {
		if( server === undefined ) server = 'time.nist.gov';
		if( port   === undefined ) port = 123;

		return new Promise( ( resolve, reject ) => {
			ntp.getNetworkTime( server, port, ( err, date ) => {
				if( err ) return reject( err );
				resolve( date.getTime() );
			} );
		} );
	}

	static getDrift() {
		return Time.ntp().then( ( ntp ) => {
			let now = Date.now();
			return ( now - ntp ) / 1000;
		} )
	}

}

module.exports = Time;

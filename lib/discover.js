"use strict";

const mdns = require( 'mdns' );

class Discover {

	// Search for a host with given service name
	static mDNS( fingerprint ) {
		return new Promise( ( resolve ) => {

			// The first 7 chars are enough to find our broker
			let service = 'es-' + fingerprint.replace( /\:/g, '' ).substr( 0, 7 );

			let browser = mdns.createBrowser( mdns.tcp( service ) );

			browser.on( 'serviceUp', ( server ) => {

				// If we found a service, stop searching and resolve
				browser.stop();

				// Create mqtts URL
				resolve( 'mqtts://' + server.host + ':' + server.port.toString() );

			} );

			browser.start();

		} );
	}

}


module.exports = Discover;

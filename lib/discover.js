"use strict";

let mdns = require( 'mdns' );

class Discover {

	// Search for a host with given service name
	static mDNS( service ) {
		return new Promise( ( resolve ) => {

			let browser = mdns.createBrowser( mdns.tcp( service ) );

			browser.on( 'serviceUp', ( service ) => {
				// If we found a service, stop searching and resolve
				browser.stop();
				resolve( service );
			} );

			browser.start();

		} );
	}

}


module.exports = Discover;

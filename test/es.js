"use strict";

let assert = require( 'assert' );
let mockery = require( 'mockery' );


describe( "Class EndocrineSystem", function() {

	let time, pki, broker;
	let EndocrineSystem;

	before( ( done ) => {

		mockery.enable( {
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		} );

		// Install all mocks
		let TimeMock = require( './mocks/time.js' );
		mockery.registerMock( './time.js', new TimeMock( 1452974164 ) );

		// Require all librarys required for tests
		EndocrineSystem = require( '../lib/es.js' );
		pki = require( './mocks/pki.js' );
		time = require( './time.js' );
		let fs = require( 'fs' );
		let tmpdir = require( 'os' ).tmpdir();
		fs.writeFileSync( tmpdir + '/es-edge-key.pem', pki.serverKey );
		fs.writeFileSync( tmpdir + '/es-edge-cert.pem', pki.serverCert );
		fs.writeFileSync( tmpdir + '/es-edge-ca.pem', pki.ca );
		let mosca = require( 'mosca' );
		broker = new mosca.Server( {
			interfaces: [ {
				type: 'mqtts',
				port: 8888,
				host: '127.0.0.1',
				credentials: {
					keyPath: tmpdir + '/es-edge-key.pem',
					certPath: tmpdir + '/es-edge-cert.pem',
					caPath: [ tmpdir + '/es-edge-ca.pem' ],
					requestCert: true,
					rejectUnauthorized: false
				}
			} ],
			persistence: { factory: mosca.persistence.Memory }
		}, done );

	} );

	after( ( done ) => {

		mockery.disable();

		broker.close( done );

	} );

	it( "should reject connecting to the broker due to non-matching key and certificate", ( done ) => {

	} );

	it( "should reject connecting to the broker due to non-matching certificate and CA", ( done ) => {

	} );

	it( "should reject connecting to the broker due to too large time drift", ( done ) => {

	} );

	it( "should connect to the broker even with a large time drift, if the es shall ignore it", ( done ) => {

	} );

	it( "should fail to connect to the broker if it is not existent", ( done ) => {

	} );

	it( "should connect to the broker, emit the online event, get the online state, create a gland / receptor and then disconnect", ( done ) => {

	} );

	it( "should connect to the broker and emit the offline event, if the connection is lost and then reconnect to the broker", ( done ) => {

	} );

	it( "should connect to the broker and emit the offline event, if the connection is lost and then reconnect to the broker", ( done ) => {

	} );

	it( "should subscribe to a topic and publish / receive a message", ( done ) => {

	} );

} );

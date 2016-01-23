"use strict";

let assert = require( 'assert' );
let mockery = require( 'mockery' );


describe( "Class EndocrineSystem", function() {

	let time, pki, broker, mosca;
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
		let SourceMock = require( './mocks/source.js' );
		mockery.registerMock( './source.js', SourceMock );
		let SinkMock = require( './mocks/sink.js' );
		mockery.registerMock( './sink.js', SinkMock );

		// Require all librarys required for tests
		EndocrineSystem = require( '../lib/es.js' );
		pki = require( './mocks/pki.js' );
		time = require( './time.js' );
		let fs = require( 'fs' );
		let tmpdir = require( 'os' ).tmpdir();
		fs.writeFileSync( tmpdir + '/es-edge-key.pem', pki.serverKey );
		fs.writeFileSync( tmpdir + '/es-edge-cert.pem', pki.serverCert );
		fs.writeFileSync( tmpdir + '/es-edge-ca.pem', pki.ca );
		mosca = require( 'mosca' );
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

		let es = new EndocrineSystem( {
			broker: 'mqtts://127.0.0.1:8888',
			cert: pki.otherCert,
			key: pki.key,
			ca: pki.ca
		} );

		es._publish( 't', 't' ).catch( ( e ) => { /*console.log( e );*/ done(); } );

	} );

	it( "should reject connecting to the broker due to non-matching certificate and CA", ( done ) => {

		let es = new EndocrineSystem( {
			broker: 'mqtts://127.0.0.1:8888',
			cert: pki.otherCert,
			key: pki.otherKey,
			ca: pki.ca
		} );

		es._publish( 't', 't' ).catch( ( e ) => { /*console.log( e );*/ done(); } );

	} );

	it( "should reject connecting to the broker due to too large time drift", ( done ) => {

		time.setDrift( 11 );

		let es = new EndocrineSystem( {
			broker: 'mqtts://127.0.0.1:8888',
			cert: pki.cert,
			key: pki.key,
			ca: pki.ca
		} );

		es._publish( 't', 't' ).catch( ( e ) => { /*console.log( e );*/ done(); } );

	} );

	it( "should connect to the broker even with a large time drift, if the es shall ignore it", ( done ) => {

		time.setDrift( 11 );

		let es = new EndocrineSystem( {
			broker: 'mqtts://127.0.0.1:8888',
			cert: pki.cert,
			key: pki.key,
			ca: pki.ca,
			ignoreTimedrift: true
		} );

		es._publish( 't', 't' ).then( () => done() );

	} );

	it( "should fail to connect to the broker if it is not existent", ( done ) => {

		time.setDrift( 0 );

		let es = new EndocrineSystem( {
			broker: 'mqtts://127.0.0.1:8887',
			cert: pki.cert,
			key: pki.key,
			ca: pki.ca
		} );

		es._publish( 't', 't' ).then( () => done( new Error( "This shouldn't happen") ) );

		setTimeout( done, 1800 );

	} );

	it( "should connect to the broker, emit the online event, get the online state, create a gland / receptor and then disconnect", ( done ) => {

		let es = new EndocrineSystem( {
			broker: 'mqtts://127.0.0.1:8888',
			cert: pki.cert,
			key: pki.key,
			ca: pki.ca
		} );

		es.on( 'online', () => {
			try {
				assert.equal( es.online, true );
			} catch( e ) { done( e ); }
			es.newGland( 'test' );
			es.newReceptor( '#' );
			es.destroy();
		} );

		es.on( 'offline', () => {
			try {
				assert.equal( es.online, false );
				done();
			} catch( e ) { done( e ); }
		} );

	} );

	it( "should connect to the broker and emit the offline event, if the connection is lost and then reconnect to the broker", ( done ) => {

		let es = new EndocrineSystem( {
			broker: 'mqtts://127.0.0.1:8888',
			cert: pki.cert,
			key: pki.key,
			ca: pki.ca
		} );

		es.once( 'online', () => {
			broker.close();
		} );

		es.once( 'offline', () => {

			// Recreate broker
			let tmpdir = require( 'os' ).tmpdir();
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
			} );

			es.once( 'online', () => {
				done();
			} );

		} );

	} );

	it( "should subscribe to a topic and publish / receive a message", ( done ) => {

		let es = new EndocrineSystem( {
			broker: 'mqtts://127.0.0.1:8888',
			cert: pki.cert,
			key: pki.key,
			ca: pki.ca
		} );

		es._subscribe( 'test/+/test', ( topic, message ) => {
			try {
				assert.equal( topic, 'test/da/test' );
				assert.equal( message, '42' );
				done();
			} catch( e ) {
				done( e );
			}
		} ).then( () => {
			es._publish( 'test/da/test', '42' )
		} )

	} );

} );

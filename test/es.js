"use strict";

const assert = require( 'assert' );
const mockery = require( 'mockery' );


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
					caPaths: [ tmpdir + '/es-edge-ca.pem' ],
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

	it( "should reject connecting to the core due to non-matching key and certificate", ( done ) => {

		let es = new EndocrineSystem( {
			core: 'mqtts://127.0.0.1:8888',
			cert: pki.otherCert,
			key: pki.key,
			ca: pki.ca,
			rejectUnauthorized: false
		} );

		es._publish( 't', 't' ).catch( ( e ) => { /*console.log( e );*/ done(); } );

	} );

	it( "should reject connecting to the core due to non-matching certificate and CA", ( done ) => {

		let es = new EndocrineSystem( {
			core: 'mqtts://127.0.0.1:8888',
			cert: pki.otherCert,
			key: pki.otherKey,
			ca: pki.ca,
			rejectUnauthorized: false
		} );

		es._publish( 't', 't' ).catch( ( e ) => { /*console.log( e );*/ done(); } );

	} );

	it( "should reject connecting to the core due to too large time drift", ( done ) => {

		time.setDrift( 11000 );

		let es = new EndocrineSystem( {
			core: 'mqtts://127.0.0.1:8888',
			cert: pki.cert,
			key: pki.key,
			ca: pki.ca,
			rejectUnauthorized: false
		} );

		es._publish( 't', 't' ).catch( ( e ) => { /*console.log( e );*/ done(); } );

	} );

	it( "should connect to the core even with a large time drift, if the es shall ignore it", ( done ) => {

		time.setDrift( 11000 );

		let es = new EndocrineSystem( {
			core: 'mqtts://127.0.0.1:8888',
			cert: pki.cert,
			key: pki.key,
			ca: pki.ca,
			ignoreTimedrift: true,
			rejectUnauthorized: false
		} );

		es._publish( 't', 't' ).then( () => done() );

	} );

	it( "should fail to connect to the core if it is not existent", ( done ) => {

		time.setDrift( 0 );

		let es = new EndocrineSystem( {
			core: 'mqtts://127.0.0.1:8887',
			cert: pki.cert,
			key: pki.key,
			ca: pki.ca,
			rejectUnauthorized: false
		} );

		es._publish( 't', 't' ).then( () => done( new Error( "This shouldn't happen") ) );

		setTimeout( done, 1800 );

	} );

	it( "should reject core in unkown format", ( done ) => {
		try {

			let es = new EndocrineSystem( {
				core: true,
				cert: pki.cert,
				key: pki.key,
				ca: pki.ca,
				rejectUnauthorized: false
			} );

		} catch( e ) { /*console.log( e );*/ done(); }
	} );

	it( "should use discovery functions for obtaining core address", ( done ) => {

		const url = 'mqtts://127.0.0.1:8888'

		// Function will resolve at the 2nd call
		let a_cnt = 0;
		function a() {
			if( ++a_cnt == 2 ) return Promise.resolve( url );
			return Promise.reject();
		}

		let fp;
		function b( _fp ) {
			fp = _fp;
			return Promise.reject();
		}

		let es = new EndocrineSystem( {
			core: [ a, b ],
			cert: pki.cert,
			key: pki.key,
			ca: pki.ca,
			rejectUnauthorized: false
		} );

		es.on( 'online', ( env ) => {
			try {
				assert.strictEqual( env.url, url );
				assert.strictEqual( a_cnt, 2 );
				assert.strictEqual( fp, 'cd:f8:9b:cc:05:8a:c4:f3:a0:67:4c:6f:d6:84:84:87:d2:d9:2e:e9:34:54:b8:b3:da:de:96:52:1c:18:b3:ca' );
				es.shutdown();
			} catch( e ) { done( e ); }
		} );

		es.on( 'offline', ( env ) => {
			try {
				assert.strictEqual( env.url, url );
				done();
			} catch( e ) { done( e ); }
		} );

	} );

	it( "should connect to the core, emit the online event, get the online state, create a gland / receptor and then disconnect", ( done ) => {

		let es = new EndocrineSystem( {
			core: 'mqtts://127.0.0.1:8888',
			cert: pki.cert,
			key: pki.key,
			ca: pki.ca,
			rejectUnauthorized: false
		} );

		es.on( 'online', () => {
			try {
				assert.strictEqual( es.online, true );
			} catch( e ) { done( e ); }
			es.newGland( 'test' );
			es.newReceptor( '#' );
			es.shutdown();
		} );

		es.on( 'offline', () => {
			try {
				assert.strictEqual( es.online, false );
				done();
			} catch( e ) { done( e ); }
		} );

	} );

	it( "should connect to the core and emit the offline event, if the connection is lost and then reconnect to the core", ( done ) => {

		let es = new EndocrineSystem( {
			core: 'mqtts://127.0.0.1:8888',
			cert: pki.cert,
			key: pki.key,
			ca: pki.ca,
			rejectUnauthorized: false
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
			core: 'mqtts://127.0.0.1:8888',
			cert: pki.cert,
			key: pki.key,
			ca: pki.ca,
			rejectUnauthorized: false
		} );

		es._subscribe( 'test/+/test', ( topic, message ) => {
			try {
				assert.strictEqual( topic, 'test/da/test' );
				assert.strictEqual( message, '42' );
				done();
			} catch( e ) {
				done( e );
			}
		} ).then( () => {
			es._publish( 'test/da/test', '42' )
		} )

	} );

	it( "should subscribe with two instances to a topic, publish / receive a message, then one instance unsubscribes and the other still reveives messages", ( done ) => {

		function pTimeout( msec ) { return new Promise( ( resolve ) => {
			// https://www.youtube.com/watch?v=IhchfhxvPKI
			setTimeout( resolve, msec );
		} ); }

		let es = new EndocrineSystem( {
			core: 'mqtts://127.0.0.1:8888',
			cert: pki.cert,
			key: pki.key,
			ca: pki.ca,
			rejectUnauthorized: false
		} );

		let lastTopic1, lastTopic2, lastMessage1, lastMessage2;
		let handle1, handle2;
		Promise.all( [
			es._subscribe( 'test', ( topic, message ) => {
				lastTopic1 = topic;
				lastMessage1 = message;
			} ),
			es._subscribe( 'test', ( topic, message ) => {
				lastTopic2 = topic;
				lastMessage2 = message;
			} )
		] ).then( ( handles ) => {
			handle1 = handles[ 0 ];
			handle2 = handles[ 1 ];

			return es._publish( 'test', '42' );
		} ).then( () => pTimeout( 200 ) ).then( () => {
			// After 200ms every should taken place ... bad coding style though
			assert.strictEqual( lastTopic1, 'test' );
			assert.strictEqual( lastTopic2, 'test' );
			assert.strictEqual( lastMessage1, '42' );
			assert.strictEqual( lastMessage2, '42' );

			// Unsubscribe first subscription
			return es._unsubscribe( handle1 );
		} ).then( () => {
			return es._publish( 'test', '43' );
		} ).then( () => pTimeout( 200 ) ).then( () => {
			// After 200ms every should taken place ... bad coding style though
			assert.strictEqual( lastTopic1, 'test' );
			assert.strictEqual( lastTopic2, 'test' );
			assert.strictEqual( lastMessage1, '42' );
			assert.strictEqual( lastMessage2, '43' );

			// Unsubscribe second subscription
			return es._unsubscribe( handle2 );
		} ).then( done ).catch( done );

	} );

} );

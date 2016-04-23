"use strict";

const assert = require( 'assert' );
const mockery = require( 'mockery' );


describe( "Class Sink", () => {

	let time, es, data;
	let Sink;

	before( () => {

		mockery.enable( {
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		} );

		// Install all mocks
		let TimeMock = require( './mocks/time.js' );
		let ESMock = require( './mocks/es.js' );
		mockery.registerMock( './es.js', ESMock );
		mockery.registerMock( './time.js', new TimeMock( 1452974164020 ) );

		let pki = require( './mocks/pki.js' );
		time = require( './time.js' );
		data = require( './mocks/data.js' );
		es = new ESMock( pki.key, pki.cert, pki.ca );

		Sink = require( '../lib/sink.js' );

	} );

	after( () => {

		mockery.disable();

	} );

	it( "should complain about missing filter", ( done ) => {
		try {

			let s = new Sink( es );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about wrong pattern filter", ( done ) => {
		try {

			let s = new Sink( es, '/test' );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about silly cert check function", ( done ) => {
		try {

			let s = new Sink( es, 'test', true );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should throw an error if subscription to es fails", ( done ) => {

		// Set subscription handler
		es._onsub[ 'definition/' + data.min.name ] = function() { return Promise.reject(); };

		let s = new Sink( es, data.min.name );
		s.on( 'error', ( err ) => {
			done();
		} );

	} );

	it( "should reject a received definition due to cert validity in future", ( done ) => {

		// Set subscription handler
		es._onsub[ 'definition/' + data.min.name ] = function( handler ) {
			setImmediate( () => handler(
				'definition/' + data.min.name,
				data.min.definition.payload
			) );
			return Promise.resolve();
		};

		// Set time
		time.set( data.min.definition.validity.start - 1 );

		let s = new Sink( es, data.min.name );

		s.on( 'receptionError', ( err, env ) => {
			/*console.log(err,env);*/
			done();
		} );

	} );

	it( "should reject a received definition due to cert validity in past", ( done ) => {

		// Set subscription handler
		es._onsub[ 'definition/' + data.min.name ] = function( handler ) {
			setImmediate( () => handler(
				'definition/' + data.min.name,
				data.min.definition.payload
			) );
			return Promise.resolve();
		};

		// Set time
		time.set( data.min.definition.validity.end + 1 );

		let s = new Sink( es, data.min.name );

		s.on( 'receptionError', ( e ) => {
			/*console.log(e);*/
			done();
		} );

	} );

	it( "should reject a received definition due to cert check function", ( done ) => {

		// Set subscription handler
		es._onsub[ 'definition/' + data.min.name ] = function( handler ) {
			setImmediate( () => handler(
				'definition/' + data.min.name,
				data.min.definition.payload
			) );
			return Promise.resolve();
		};

		// Set time
		time.set( data.min.definition.validity.end );

		let s = new Sink( es, data.min.name, ( name, cert ) => {

			try {
				assert.strictEqual( name, data.min.name );
				assert.strictEqual( cert.commonName, 'Test Client' );
			} catch( e ) {
				done( e );
			}

			return Promise.reject( new Error( "Nope" ) );

		} );

		s.on( 'receptionError', ( err ) => {

			try {
				assert.strictEqual( err.message, "Nope" );
				done();
			} catch( e ) {
				done( e );
			}

		} );

	} );

	it( "should receive a definition, emit subscribe event and then remove the definition with the unsubscribe event emitted", ( done ) => {

		let defHandler;

		// Set subscription handler
		es._onsub[ 'definition/' + data.min.name ] = function( handler ) {
			setImmediate( () => handler(
				'definition/' + data.min.name,
				data.min.definition.payload
			) );
			defHandler = handler;
			return Promise.resolve();
		};

		let s = new Sink( es, data.min.name );

		s.on( 'defined', ( env ) => {
			try {
				assert.strictEqual( env.name, data.min.name );
				assert.deepStrictEqual( env.dataFormat, data.min.definition.dataFormat );
				assert.deepStrictEqual( env.origin, data.min.origin );

				// Send empty message to remove definition
				defHandler( 'definition/' + data.min.name, '' );
			} catch( e ) {
				done( e );
			}
		} );

		s.on( 'undefined', ( env ) => {
			try {
				assert.strictEqual( env.name, data.min.name );
				assert.deepStrictEqual( env.dataFormat, data.min.definition.dataFormat );
				assert.deepStrictEqual( env.origin, data.min.origin );
				done();
			} catch( e ) {
				done( e );
			}
		} );

	} );

	it( "should receive a definition, emit subscribe event and then receive the same definition again ignoring it silently", ( done ) => {

		let defHandler;

		// Set subscription handler
		es._onsub[ 'definition/' + data.min.name ] = function( handler ) {
			setImmediate( () => handler(
				'definition/' + data.min.name,
				data.min.definition.payload
			) );
			defHandler = handler;
			return Promise.resolve();
		};

		let s = new Sink( es, data.min.name );

		s.on( 'defined', ( env ) => {
			try {
				assert.strictEqual( env.name, data.min.name );
				assert.deepStrictEqual( env.dataFormat, data.min.definition.dataFormat );
				assert.deepStrictEqual( env.origin, data.min.origin );

				// Send definition again
				defHandler( 'definition/' + data.min.name, data.min.definition.payload );
			} catch( e ) {
				done( e );
			}

		} );

		s.on( 'undefined', () => {
			done( new Error("Nope!") );
		} );

		s.on( 'refreshed', ( env ) => {
			try {
				assert.strictEqual( env.name, data.min.name );
				assert.deepStrictEqual( env.dataFormat, data.min.definition.dataFormat );
				assert.deepStrictEqual( env.origin, data.min.origin );

				done();
			} catch( e ) {
				done( e );
			}
		} );

	} );

	it( "should receive a definition, emit subscribe event and then receive a modified definition again", ( done ) => {

		let defHandler;

		// Set subscription handler
		es._onsub[ 'definition/' + data.min.name ] = function( handler ) {
			setImmediate( () => handler(
				'definition/' + data.min.name,
				data.min.definition.payload
			) );
			defHandler = handler;
			return Promise.resolve();
		};

		let s = new Sink( es, data.min.name );

		s.once( 'defined', ( env ) => {
			try {
				assert.strictEqual( env.name, data.min.name );
				assert.deepStrictEqual( env.dataFormat, data.min.definition.dataFormat );
				assert.deepStrictEqual( env.origin, data.min.origin );

				// Send new definition
				defHandler( 'definition/' + data.min.name, data.max.definition.payload );
			} catch( e ) {
				done( e );
			}

			// Try to observe unsubscribe and subscribe again
			let unsub = false;
			s.once( 'undefined', () => { unsub = true; } );
			s.once( 'defined', () => {
				if( ! unsub ) done( new Error( "Nope" ) );
				else done();
			} );

		} );

	} );

	it( "should receive a hormone, emit the hormone event and expose the hormone", ( done ) => {

		// Set subscription handler
		es._onsub[ 'definition/' + data.max.name ] = function( handler ) {
			setImmediate( () => handler(
				'definition/' + data.max.name,
				data.max.definition.payload
			) );
			return Promise.resolve();
		};
		es._onsub[ 'hormone/' + data.max.name ] = function( handler ) {
			setImmediate( () => handler(
				'hormone/' + data.max.name,
				data.max.hormone[0].payload
			) );
			return Promise.resolve();
		};

		// Set time
		time.set( data.max.hormone[0].timestamp + 100 );

		let s = new Sink( es, data.max.name );

		s.on( 'receptionError', done );
		s.on( 'error', done );

		s.on( 'hormone', ( env ) => {
			try {
				assert.strictEqual( env.name, data.max.name );
				assert.deepStrictEqual( env.data, data.max.hormone[0].data );
				assert.deepStrictEqual( env.origin, data.max.origin );

				assert.strictEqual( s.hormones.length, 1 );
				assert.strictEqual( s.expiredHormones.length, 0 );
				assert.strictEqual( s.erroneousHormones.length, 0 );
				assert.strictEqual( s.goodHormones.length, 1 );
				assert.deepStrictEqual( s.hormones[0], {
					name: data.max.name,
					sentAt: data.max.hormone[0].timestamp,
					receivedAt: data.max.hormone[0].timestamp + 100,
					stateChangedAt: data.max.hormone[0].timestamp + 100,
					isOK: true,
					error: 0,
					freshness: 0.9,
					isFresh: true,
					data: data.max.hormone[0].data,
					dataFormat: data.max.definition.dataFormat
				} );

				done();
			} catch( e ) { done( e ); }
		} );

	} );

	it( "should ignore duplicate hormones", ( done ) => {

		let hormoneHandler;

		// Set subscription handler
		es._onsub[ 'definition/' + data.max.name ] = function( handler ) {
			setImmediate( () => handler(
				'definition/' + data.max.name,
				data.max.definition.payload
			) );
			return Promise.resolve();
		};
		es._onsub[ 'hormone/' + data.max.name ] = function( handler ) {
			setImmediate( () => handler(
				'hormone/' + data.max.name,
				data.max.hormone[0].payload
			) );
			hormoneHandler = handler;
			return Promise.resolve();
		};

		// Set time
		time.set( data.max.hormone[0].timestamp + 100 );

		let s = new Sink( es, data.max.name );

		s.on( 'receptionError', done );
		s.on( 'error', done );

		s.once( 'hormone', () => {
			s.once( 'hormone', () => done( new Error("Nope") ) );
			// Emit the hormone a second time
			hormoneHandler( 'hormone/' + data.max.name, data.max.hormone[0].payload );
			setTimeout( done, 200 );
		} );

	} );

	it( "should not ignore new hormones", ( done ) => {

		let hormoneHandler;

		// Set subscription handler
		es._onsub[ 'definition/' + data.max.name ] = function( handler ) {
			setImmediate( () => handler(
				'definition/' + data.max.name,
				data.max.definition.payload
			) );
			return Promise.resolve();
		};
		es._onsub[ 'hormone/' + data.max.name ] = function( handler ) {
			setImmediate( () => handler(
				'hormone/' + data.max.name,
				data.max.hormone[0].payload
			) );
			hormoneHandler = handler;
			return Promise.resolve();
		};

		// Set time
		time.set( data.max.hormone[0].timestamp );

		let s = new Sink( es, data.max.name );

		s.on( 'receptionError', done );
		s.on( 'error', done );

		s.once( 'hormone', () => {
			s.once( 'hormone', ( env ) => {
				try {
					assert.strictEqual( env.name, data.max.name );
					assert.deepStrictEqual( env.data, data.max.hormone[1].data );
					assert.deepStrictEqual( env.origin, data.max.origin );
					done();
				} catch( e ) {
					done( e );
				}
			} );
			// Emit the hormone a second time
			hormoneHandler( 'hormone/' + data.max.name, data.max.hormone[1].payload );
		} );

	} );

	it( "should receive a erroneous hormone and emit the hormoneError event", ( done ) => {

		// Set subscription handler
		es._onsub[ 'definition/' + data.max.name ] = function( handler ) {
			setImmediate( () => handler(
				'definition/' + data.max.name,
				data.max.definition.payload
			) );
			return Promise.resolve();
		};
		es._onsub[ 'hormone/' + data.max.name ] = function( handler ) {
			setImmediate( () => handler(
				'hormone/' + data.max.name,
				data.max.hormoneErr[0].payload
			) );
			return Promise.resolve();
		};

		// Set time
		time.set( data.max.hormoneErr[0].timestamp );

		let s = new Sink( es, data.max.name );

		s.on( 'receptionError', done );
		s.on( 'error', done );

		s.on( 'hormoneError', ( env ) => {
			try {
				assert.strictEqual( env.name, data.max.name );
				assert.strictEqual( env.error, data.max.hormoneErr[0].data.Number );
				assert.deepStrictEqual( env.data, data.max.hormoneErr[0].data );
				assert.strictEqual( s.hormones.length, 1 );
				assert.strictEqual( s.expiredHormones.length, 0 );
				assert.strictEqual( s.erroneousHormones.length, 1 );
				assert.strictEqual( s.goodHormones.length, 0 );
				done();
			} catch( e ) {
				done( e );
			}
		} );

	} );

	it( "should receive a fresh hormone and emit the hormoneExpired event later", ( done ) => {

		// Set subscription handler
		es._onsub[ 'definition/' + data.max.name ] = function( handler ) {
			setImmediate( () => handler(
				'definition/' + data.max.name,
				data.max.definition.payload
			) );
			return Promise.resolve();
		};
		es._onsub[ 'hormone/' + data.max.name ] = function( handler ) {
			setImmediate( () => handler(
				'hormone/' + data.max.name,
				data.max.hormone[0].payload
			) );
			return Promise.resolve();
		};

		// Set time 100ms before expiration
		time.set( data.max.hormone[0].timestamp + 900 );

		let s = new Sink( es, data.max.name );

		s.on( 'receptionError', done );
		s.on( 'error', done );

		s.on( 'hormone', ( env ) => {
			try {
				assert.equal( env.name, data.max.name );
				assert.equal( s.hormones.length, 1 );
				assert.equal( s.expiredHormones.length, 0 );
				assert.equal( s.erroneousHormones.length, 0 );
				assert.equal( s.goodHormones.length, 1 );
			} catch( e ) {
				done( e );
			}
		} );

		s.on( 'hormoneExpiration', ( env ) => {
			try {
				assert.equal( env.name, data.max.name );
				assert.equal( s.hormones.length, 1 );
				assert.equal( s.expiredHormones.length, 1 );
				assert.equal( s.erroneousHormones.length, 0 );
				assert.equal( s.goodHormones.length, 0 );
				done();
			} catch( e ) {
				done( e );
			}
		} );

	} );

	it( "should receive a fresh hormone, immediately undefine the source and not emit the hormoneExpired event", ( done ) => {

		let defHandler;

		// Set subscription handler
		es._onsub[ 'definition/' + data.max.name ] = function( handler ) {
			setImmediate( () => handler(
				'definition/' + data.max.name,
				data.max.definition.payload
			) );
			defHandler = handler;
			return Promise.resolve();
		};
		es._onsub[ 'hormone/' + data.max.name ] = function( handler ) {
			setImmediate( () => handler(
				'hormone/' + data.max.name,
				data.max.hormone[0].payload
			) );
			return Promise.resolve();
		};

		// Set time 100ms before expiration
		time.set( data.max.hormone[0].timestamp + 900 );

		let s = new Sink( es, data.max.name );

		s.on( 'receptionError', done );
		s.on( 'error', done );

		s.on( 'hormone', () => {
			defHandler( 'definition/' + data.max.name, '' );
			setTimeout( done, 400 );
		} );

		s.on( 'hormoneExpiration', () => {
			done( new Error( "This must not happen!" ) );
		} );

	} );

} );

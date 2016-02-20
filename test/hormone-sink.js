"use strict";

const assert = require( 'assert' );
const mockery = require( 'mockery' );


describe( "Class HormoneSink", () => {

	let time, pki, data, definition;
	let HormoneSink;

	before( () => {

		mockery.enable( {
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		} );

		// Install all mocks
		let TimeMock = require( './mocks/time.js' );
		mockery.registerMock( './time.js', new TimeMock( 1452974164020 ) );

		// require all librarys required for tests
		pki = require( './mocks/pki.js' );
		data = require( './mocks/data.js' );
		time = require( './time.js' );
		HormoneSink = require( '../lib/hormone-sink.js' );
		let DefinitionSink = require( '../lib/definition-sink.js' );
		// TODO: Maybe it's a good idea to mock definition class
		definition = new DefinitionSink( data.max.definition.payload );

	} );

	after( () => {

		mockery.disable();

	} );

	it( "should complain about missing defintion", ( done ) => {
		try {

			let h = new HormoneSink();

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about missing payload", ( done ) => {
		try {

			let h = new HormoneSink( definition );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about wrong signature", ( done ) => {
		try {

			let h = new HormoneSink( definition, data.max.hormone[0].payloadWrongSignature );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should successfully read hormone payload", ( done ) => {

		let h = new HormoneSink( definition, data.max.hormone[0].payload );

		assert.deepStrictEqual( h.data, data.max.hormone[0].data );
		assert.deepStrictEqual( h.payload, data.max.hormone[0].payload );
		assert.deepStrictEqual( h.error, data.max.hormone[0].data.Number );
		assert.deepStrictEqual( h.timestamp, data.max.hormone[0].timestamp );
		assert.deepStrictEqual( h.definition.data, definition.data );

		done();

	} );

	it( "should successfully read erroneous hormone payload", ( done ) => {

		let h = new HormoneSink( definition, data.max.hormoneErr[0].payload );

		assert.deepStrictEqual( h.data, data.max.hormoneErr[0].data );
		assert.deepStrictEqual( h.payload, data.max.hormoneErr[0].payload );
		assert.deepStrictEqual( h.error, data.max.hormoneErr[0].data.Number );
		assert.deepStrictEqual( h.timestamp, data.max.hormoneErr[0].timestamp );
		assert.deepStrictEqual( h.definition.data, definition.data );

		done();

	} );

	it( "should create and read fresh hormone", ( done ) => {

		time.set( data.max.hormone[0].timestamp );

		let h = new HormoneSink( definition, data.max.hormone[0].payload );

		assert.strictEqual( h.freshness, 1 );
		assert.strictEqual( h.isFresh, true );

		done();

	} );

	it( "should create and read expired hormone", ( done ) => {

		time.set( data.max.hormone[0].timestamp + 3000 );

		let h = new HormoneSink( definition, data.max.hormone[0].payload );

		assert.strictEqual( h.freshness, -2 );
		assert.strictEqual( h.isFresh, false );

		done();

	} );

} );

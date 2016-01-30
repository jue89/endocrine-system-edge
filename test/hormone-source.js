"use strict";

let assert = require( 'assert' );
let mockery = require( 'mockery' );


describe( "Class HormoneSource", () => {

	let time, pki, data, definition;
	let HormoneSource;

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
		HormoneSource = require( '../lib/hormone-source.js' );
		let DefinitionSource = require( '../lib/definition-source.js' );
		// TODO: Maybe it's a good idea to mock definition class
		definition = new DefinitionSource( pki.key, data.max.definition.data );

	} );

	after( () => {

		mockery.disable();

	} );

	it( "should not create new hormone due to missing private key", ( done ) => {
		try {

			let h = new HormoneSource();

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should not create new hormone due to missing definition", ( done ) => {
		try {

			let h = new HormoneSource( pki.key );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should not create new hormone due to missing data", ( done ) => {
		try {

			let h = new HormoneSource( pki.key, definition );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should not create new definition due to unkown option", ( done ) => {
		try {

			let h = new HormoneSource( pki.key, definition, data.max.hormone[0].dataUnkownOption );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should create new hormone", ( done ) => {

		time.set( data.max.hormone[0].timestamp );

		let h = new HormoneSource( pki.key, definition, data.max.hormone[0].data );

		assert.deepStrictEqual( h.payload, data.max.hormone[0].payload );
		assert.deepStrictEqual( h.data, data.max.hormone[0].data );
		assert.deepStrictEqual( h.timestamp, data.max.hormone[0].timestamp );
		assert.deepStrictEqual( h.definition.data, definition.data );

		done();

	} );

	it( "should create new erroneous hormone", ( done ) => {

		time.set( data.max.hormoneErr[0].timestamp );

		let h = new HormoneSource( pki.key, definition, data.max.hormoneErr[0].data );

		assert.deepStrictEqual( h.payload, data.max.hormoneErr[0].payload );
		assert.deepStrictEqual( h.data, data.max.hormoneErr[0].data );
		assert.deepStrictEqual( h.timestamp, data.max.hormoneErr[0].timestamp );
		assert.deepStrictEqual( h.error, data.max.hormoneErr[0].data.Number );
		assert.deepStrictEqual( h.definition.data, definition.data );

		done();

	} );

	it( "should create new fresh hormone", ( done ) => {

		time.set( data.max.hormone[0].timestamp );

		let h = new HormoneSource( pki.key, definition, data.max.hormone[0].data );

		assert.strictEqual( h.freshness, 1 );
		assert.strictEqual( h.isFresh, true );

		done();

	} );

	it( "should create new expired hormone", ( done ) => {

		time.set( data.max.hormone[0].timestamp );

		let h = new HormoneSource( pki.key, definition, data.max.hormone[0].data );

		time.set( data.max.hormone[0].timestamp + 3000 );

		assert.strictEqual( h.freshness, -2 );
		assert.strictEqual( h.isFresh, false );

		done();

	} );


} );

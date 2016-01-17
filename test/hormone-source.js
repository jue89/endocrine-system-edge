"use strict";

let assert = require( 'assert' );
let mockery = require( 'mockery' );


describe( "Class HormoneSource", () => {

	let time, pki, definition;
	let HormoneSource;

	before( () => {

		mockery.enable( {
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		} );

		// Install all mocks
		let TimeMock = require( './mocks/time.js' );
		mockery.registerMock( './time.js', new TimeMock( 1452974164 ) );

		// require all librarys required for tests
		pki = require( './mocks/pki.js' );
		time = require( './time.js' );
		HormoneSource = require( '../lib/hormone-source.js' );
		let DefinitionSource = require( '../lib/definition-source.js' );
		definition = new DefinitionSource( pki.key, {
			cert: pki.cert,
			description: "Test Definition",
			check: "err=0;",
			freshness: 1,
			dataFormat: [ {
				name: "String",
				type: 'string',
				description: "Funny stuff"
			}, {
				name: "Boolean",
				type: 'boolean'
			}, {
				name: "Number",
				type: 'number',
				unit: "V"
			} ]
		} );

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

			let h = new HormoneSource( pki.key, definition, {
				'String': "test",
				'Number': 123,
				'Boolean': true,
				'Unkown': 1
			} );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should create new hormone", ( done ) => {

		let data = {
			'String': "test",
			'Number': 123,
			'Boolean': true
		};

		let h = new HormoneSource( pki.key, definition, data );

		assert.deepEqual( h.data, data );

		assert.equal( h.timestamp, 1452974164 );

		assert.deepEqual( h.definition, definition.data );

		done();

	} );

	it( "should create new fresh hormone", ( done ) => {

		let h = new HormoneSource( pki.key, definition, {
			'String': "test",
			'Number': 123,
			'Boolean': true
		} );

		assert.equal( h.isFresh, true );

		done();

	} );

	it( "should create new expired hormone", ( done ) => {

		let h = new HormoneSource( pki.key, definition, {
			'String': "test",
			'Number': 123,
			'Boolean': true
		} );

		time.addSeconds( 3 );

		assert.equal( h.isFresh, false );

		done();

	} );


} );

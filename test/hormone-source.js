"use strict";

let assert = require( 'assert' );

var DefinitionSource = require( '../lib/definition-source.js' );
var HormoneSource = require( '../lib/hormone-source.js' );
let pki = require( './pki.js' );


let d = new DefinitionSource( pki.key, {
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


describe( "Class HormoneSource", function() {
	this.timeout(3000);

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

			let h = new HormoneSource( pki.key, d );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should not create new definition due to unkown option", ( done ) => {
		try {

			let h = new HormoneSource( pki.key, d, {
				'String': "test",
				'Number': 123,
				'Boolean': true,
				'Unkown': 1
			} );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should create new hormone", ( done ) => {

		let h = new HormoneSource( pki.key, d, {
			'String': "test",
			'Number': 123,
			'Boolean': true
		} );

		done();

	} );

	it( "should create new fresh hormone", ( done ) => {

		let h = new HormoneSource( pki.key, d, {
			'String': "test",
			'Number': 123,
			'Boolean': true
		} );

		assert.equal( h.isFresh, true );

		done();

	} );

	it( "should create new expired hormone", ( done ) => {

		let h = new HormoneSource( pki.key, d, {
			'String': "test",
			'Number': 123,
			'Boolean': true
		} );

		setTimeout( () => {

			assert.equal( h.isFresh, false );

			done();

		}, 2500 );

	} );


} );

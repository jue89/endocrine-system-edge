"use strict";

let assert = require( 'assert' );


describe( "Class DefinitionSink", () => {

	let pki, data;
	let DefinitionSink;

	before( () => {

		DefinitionSink = require( '../lib/definition-sink.js' );
		pki = require( './mocks/pki.js' );
		data = require( './mocks/data.js' );

	} );

	it( "should complain about empty data", ( done ) => {
		try {

			let d = new DefinitionSink();

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about unparsable data", ( done ) => {
		try {

			let d = new DefinitionSink( "bla\nblub" );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about wrong signature", ( done ) => {
		try {

			let d = new DefinitionSink( data.min.definition.payloadWrongSignature );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about non-pem certificate", ( done ) => {
		try {

			let d = new DefinitionSink( data.min.definition.payloadWrongCert );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should accept minimal defintion format", ( done ) => {

		let d = new DefinitionSink( data.min.definition.payload );

		assert.deepStrictEqual( d.payload, data.min.definition.payload );
		assert.deepStrictEqual( d.data, data.min.definition.data );
		assert.deepStrictEqual( d.dataFormat, data.min.definition.dataFormat );

		done();
	} );

	it( "should accept full format", ( done ) => {

		let d = new DefinitionSink( data.max.definition.payload  );

		assert.deepStrictEqual( d.payload, data.max.definition.payload );
		assert.deepStrictEqual( d.data, data.max.definition.data );
		assert.deepStrictEqual( d.dataFormat, data.max.definition.dataFormat );

		done();
	} );

} );

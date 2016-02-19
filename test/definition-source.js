"use strict";

const assert = require( 'assert' );


describe( "Class DefinitionSource", () => {

	let pki, data;
	let DefinitionSource;

	before( () => {

		DefinitionSource = require( '../lib/definition-source.js' );
		pki = require( './mocks/pki.js' );
		data = require( './mocks/data.js' );

	} );

	it( "should not create new definition due to missing private key", ( done ) => {
		try {

			let d = new DefinitionSource();

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should not create new definition due to missing definition data", ( done ) => {
		try {

			let d = new DefinitionSource( pki.key );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should not create new definition due to missing cert", ( done ) => {
		try {

			let d = new DefinitionSource( pki.key, {} );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should not create new definition due to unkown option", ( done ) => {
		try {

			let d = new DefinitionSource( pki.key, data.min.definition.dataUnkownOption );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );


	it( "should create new definition with minimum option set", ( done ) => {

		let d = new DefinitionSource( pki.key, data.min.definition.data );

		assert.deepStrictEqual( d.payload, data.min.definition.payload );
		assert.deepStrictEqual( d.data, data.min.definition.data );
		assert.deepStrictEqual( d.dataFormat, data.min.definition.dataFormat );

		done();

	} );

	it( "should create new definition with full option set and create an input data check", ( done ) => {

		let d = new DefinitionSource( pki.key, data.max.definition.data );

		assert.deepStrictEqual( d.payload, data.max.definition.payload );
		assert.deepStrictEqual( d.data, data.max.definition.data );
		assert.deepStrictEqual( d.dataFormat, data.max.definition.dataFormat );

		d.dataSchema.validate( data.max.hormone[0].data );

		done();

	} );

} );

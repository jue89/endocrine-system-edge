"use strict";

let assert = require( 'assert' );
let mockery = require( 'mockery' );


describe( "Class Source", () => {

	let es;
	let Source;

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
		mockery.registerMock( './time.js', new TimeMock( 1452974164 ) );

		let pki = require( './mocks/pki.js' );

		es = new ESMock( pki.key, pki.cert, pki.ca );

		Source = require( '../lib/source.js' );

	} );

	after( () => {

		mockery.disable();

	} );

	it( "should not create new source due to missing name", ( done ) => {
		try {

			let s = new Source( es );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should not create new source due to wrong name (preceding slash)", ( done ) => {
		try {

			let s = new Source( es, '/test' );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should not create new source due to wrong name (trailing slash)", ( done ) => {
		try {

			let s = new Source( es, 'test/' );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should not create new source due to invalid definition data", ( done ) => {
		try {

			let s = new Source( es, 'test', { nope: true } );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should create source and send data", ( done ) => {

		let s = new Source( es, 'test', { dataFormat: [ { name: 'test', type: 'boolean' } ] } );

		s.on( 'defined', () => {
			try {
				assert.equal( es._lastTopic, 'definition/test' );
				s.send( { test: true } );
			} catch( e ) {
				done( new Error( "Nope!" ) );
			}
		} );

		s.on( 'sent', () => {
			done();
		} );

	} );

	it( "should create source with autoRefresh, no hormone data", ( done ) => {

		let s = new Source( es, 'test', { freshness: 2, autoRefresh: true } );
		s.on( 'sent', () => {
			done();
			s.destroy();
		} );

	} );

	it( "should create source with autoRefresh, with hormone data, but don't emit due to missing data", ( done ) => {

		let s = new Source( es, 'test', { freshness: 2, autoRefresh: true, dataFormat: [ { name: 'test', type: 'boolean' } ] } );
		s.on( 'sent', () => {
			done( new Error( "This should not happen!" ) );
		} );

		setTimeout( done, 1500 );

	} );

	it( "should create source with autoRefresh, with hormone data", ( done ) => {

		let s = new Source( es, 'test', { freshness: 2, autoRefresh: true, dataFormat: [ { name: 'test', type: 'boolean' } ] } );
		s.send( { test: true } ).then( () => {
			s.on( 'sent', () => {
				done();
			} );
		} );

	} );

} );

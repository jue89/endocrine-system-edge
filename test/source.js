"use strict";

let assert = require( 'assert' );

let Source = require( '../lib/source.js' );
let pki = require( './pki.js' );

class ESdummy {

	constructor( key, cert ) {
		this._key = key;
		this._cert = cert;
	}

	_publish( channel, payload ) {
		this._lastChannel = channel;
		this._lastPayload = payload;
		return Promise.resolve();
	}

}

let es = new ESdummy( pki.key, pki.cert );


describe( "Class Source", () => {

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
				assert.equal( es._lastChannel, 'definition/test' );
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

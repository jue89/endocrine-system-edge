"use strict";

let assert = require( 'assert' );

var DefinitionSource = require( '../lib/definition-source.js' );
var DefinitionSink = require( '../lib/definition-sink.js' );
var HormoneSource = require( '../lib/hormone-source.js' );
var HormoneSink = require( '../lib/hormone-sink.js' );
let pki = require( './pki.js' );


let dIn = new DefinitionSource( pki.key, {
	cert: pki.cert,
	description: "Test Definition",
	check: "err=Number;",
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

let d = new DefinitionSink( dIn.payload );

describe( "Class HormoneSink", function() {
	this.timeout(3000);

	it( "should complain about missing defintion", ( done ) => {
		try {

			let h = new HormoneSink();

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about missing payload", ( done ) => {
		try {

			let h = new HormoneSink( d );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about wrong signature", ( done ) => {
		try {

			let h = new HormoneSink( d, '1452029627\ntest\n1\n123\nRf/2W8SMf/xMyUKkukkST6ueXvaOlxILGBqIK4rv67R1GMrvbQPeCGDPl//iVYRqnbkgmmR86eLsNSwdnnJvxTMv2RP1j0nq4j7ezCzNc4tEch8XusY+KBOcXh4irp7BYQZzNcvMhNHKN9AmE1VrUvofDQfGl/AGshEGSJCMRN7yph9Uw6nyTCMrZghbG4hUR9Da1BD3pP6NALf8ybJNHc+VK8A2lO+cMG0lFYp3XBRknJ47dVSdvjC6JjH9acmAl8e8c2SAFyVVG0tFlNrOh5nX362Zeam5LF+I0irMCNlXzmYU1F07M2Eb/R4D5vjZSF/G+0jYJb6RKzIayY1wWQ==' );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should successfully read hormone payload", ( done ) => {

		let payload = '1452029627\ntest\n1\n123\nRf/2W8SMf/xMyUKkukkST6ueXvaOlxILGBqIK4rv67R1GMrvbQPeCGDPl//iVYRqnbkgmmR86eLsNSwdnnJvxTMv2RP1j0nq4j7ezCzNc4tEch8XusY+KBOcXh4irp7BYQZzNcvMhNHKN9AmE1VrUvofDQfGl/AGshEGSJCMRN7yph9Uw6nyTCMrZghbG4hUR9Da1BD3pP6NALf8ybJNHc+VK8A2lO+cMG0lFZp3XBRknJ47dVSdvjC6JjH9acmAl8e8c2SAFyVVG0tFlNrOh5nX362Zeam5LF+I0irMCNlXzmYU1F07M2Eb/R4D5vjZSF/G+0jYJb6RKzIayY1wWQ==';

		let h = new HormoneSink( d, payload );

		assert.deepEqual( h.data, {
			'String':  { 'value': "test" },
			'Number':  { 'value': 123, 'unit': "V" },
			'Boolean': { 'value': true }
		} );

		assert.equal( h.payload, payload );

		assert.equal( h.error, 123 );

		assert.deepEqual( h.definition, d.data );

		done();
	} );

	it( "should create and read fresh hormone", ( done ) => {

		let hIn = new HormoneSource( pki.key, dIn, {
			'String': "test",
			'Number': 123,
			'Boolean': true
		} );

		let h = new HormoneSink( d, hIn.payload );

		assert.equal( h.isFresh, true );

		done();

	} );

	it( "should create and read expired hormone", ( done ) => {

		let hIn = new HormoneSource( pki.key, dIn, {
			'String': "test",
			'Number': 123,
			'Boolean': true
		} );

		let h = new HormoneSink( d, hIn.payload );

		setTimeout( () => {

			assert.equal( h.isFresh, false );

			done();

		}, 2500 );

	} );


} );

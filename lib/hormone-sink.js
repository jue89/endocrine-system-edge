"use strict";

let crypto = require( 'crypto' );
let jsonGate = require( 'json-gate' );

let Hormone = require( './hormone.js' );
let DefinitionSink = require( './definition-sink.js');



class HormoneSink extends Hormone {

	constructor( definition, payload ) {

		super();

		// Make sure given definition is valid
		if( ! ( definition instanceof DefinitionSink ) ) {
			throw new Error( "Given definition is not vaild" );
		}

		// First check signature
		let lines = payload.split( '\n' );

		// Check the signature of payload:
		// Iterate over definition payload excluding last line
		// that holds the signature
		let sigCheck = crypto.createVerify( 'RSA-SHA256' );
		let data = [];
		for( let i = 0; i < lines.length - 1; i++ ) {
			sigCheck.update( lines[i] );
			data.push( lines[i] );
		}
		if( ! sigCheck.verify(
			definition.data.cert,
			lines[ lines.length - 1 ],
			'base64'
		) ) {
			throw new Error( "Signature is invalid" );
		}

		// Extract timestamp
		this._timestamp = data.shift();

		// Check format
		let format = definition.data.dataFormat;
		if( format.length !== data.length ) {
			throw new Error( "Expected format does not match" );
		}

		// Extract data
		this._data = {};
		for( let i = 0; i < format.length; i++ ) {

			let f = format[ i ];
			let d = {};

			if( f.unit ) d.unit = f.unit.toString();

			switch( f.type ) {
				case 'number':  d.value = parseFloat( data[i] ); break;
				case 'string':  d.value = data[i].toString(); break;
				case 'boolean': d.value = ( data[i] === '1' ) ? true : false; break;
			}

			this._data[ f.name ] = d;

		}

		// Finally store the definition
		this._definition = definition;

	}

	get data() { return this._data; }

}


// Expose the hormoneclass
module.exports = HormoneSink;

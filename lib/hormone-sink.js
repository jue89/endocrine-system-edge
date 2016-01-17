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
		let rawData = [];
		for( let i = 0; i < lines.length - 1; i++ ) {
			sigCheck.update( lines[i] );
			rawData.push( lines[i] );
		}
		if( ! sigCheck.verify(
			definition.data.cert,
			lines[ lines.length - 1 ],
			'base64'
		) ) {
			throw new Error( "Signature is invalid" );
		}

		// Extract timestamp
		let timestamp = parseInt( rawData.shift() );

		// Check format
		let format = definition.data.dataFormat
		if( format.length !== rawData.length ) {
			throw new Error( "Expected format does not match" );
		}

		// Extract data
		let data = {};
		for( let i = 0; i < format.length; i++ ) {

			let f = format[ i ];
			let d = {};

			if( f.unit ) d.unit = f.unit.toString();

			switch( f.type ) {
				case 'number':  d.value = parseFloat( rawData[i] ); break;
				case 'string':  d.value = rawData[i].toString(); break;
				case 'boolean': d.value = ( rawData[i] === '1' ) ? true : false; break;
			}

			data[ f.name ] = d;

		}

		// Finally store all data
		this._payload = payload;
		this._data = data;
		this._definition = definition;
		this._timestamp = timestamp;

	}

}


// Expose the hormoneclass
module.exports = HormoneSink;

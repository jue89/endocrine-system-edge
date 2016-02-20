"use strict";

const crypto = require( 'crypto' );
const jsonGate = require( 'json-gate' );

const Hormone = require( './hormone.js' );
const DefinitionSink = require( './definition-sink.js');



class HormoneSink extends Hormone {

	constructor( definition, payload ) {

		super();

		// Make sure given definition is valid
		if( ! ( definition instanceof DefinitionSink ) ) {
			throw new Error( "Given definition is not vaild" );
		}

		// Get lines of payload
		let lines = payload.split( '\n' );

		// First check signature:
		// - Get signature (last line)
		let signature = lines.pop();
		// - Check the signature of payload excluding the signature
		let signatureCheck = crypto.createVerify( 'RSA-SHA256' );
		signatureCheck.update( payload.substr( 0, payload.lastIndexOf('\n') + 1 ) );
		if( ! signatureCheck.verify(
			definition.data.cert,
			signature,
			'base64'
		) ) {
			throw new Error( "Signature is invalid" );
		}

		// Extract timestamp
		let timestamp = parseInt( lines.shift() );

		// Check format
		let format = definition.data.dataFormat;
		if( format.length !== lines.length ) {
			throw new Error( "Expected format does not match" );
		}

		// Extract data
		let data = {};
		for( let i = 0; i < format.length; i++ ) {

			let f = format[ i ];

			switch( f.type ) {
				case 'number':  data[ f.name ] = parseFloat( lines[i] ); break;
				case 'string':  data[ f.name ] = lines[i].toString(); break;
				case 'boolean': data[ f.name ] = ( lines[i] === '1' ) ? true : false; break;
			}

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

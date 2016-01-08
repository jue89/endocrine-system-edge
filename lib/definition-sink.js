"use strict";

let crypto = require( 'crypto' );
let jsonGate = require( 'json-gate' );

let definitionSchema = require( './definition-schema.js' );
let Definition = require( './definition.js' );



class DefinitionSink extends Definition {

	constructor( payload ) {

		super();

		let lines = payload.split( '\n' );

		// Check the signature of payload:
		// Iterate over definition payload excluding last line
		// that holds the signature
		let sigCheck = crypto.createVerify( 'RSA-SHA256' );
		let jsonData = "";
		for( let i = 0; i < lines.length - 1; i++ ) {
			sigCheck.update( lines[i] );
			jsonData += lines[i];
		}

		// First try to interprete jsonData.
		// The parser will throw an error if this fails
		let definition = JSON.parse( jsonData );

		// Check the format of data:
		// If the format differs from expected the validator will throw an error
		definitionSchema.validate( definition );

		// And the final signature Check
		if( ! sigCheck.verify( definition.cert, lines[ lines.length - 1 ], 'base64' ) ) {
			throw new Error( "Signature is invalid" );
		}

		// If we got here, everything seems to be fine! :)
		// Store all information
		this._data = definition;
		this._payload = payload;

	}

}


// Expose the definition class
module.exports = DefinitionSink;

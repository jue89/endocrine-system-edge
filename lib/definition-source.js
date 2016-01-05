"use strict";

let crypto = require( 'crypto' );
let jsonGate = require( 'json-gate' );

let definitionSchema = require( './definition-schema.js' );



class DefinitionSource {

	constructor( key, definition ) {

		// Make sure we have a private key
		if( ! key ) {
			throw new Error( "No private key is given" );
		}

		// Check schema of data
		definitionSchema.validate( definition );

		// Convert the definition data object into a JSON string
		let payload = JSON.stringify( definition );

		// Create a signature and append it
		let sigCreation = crypto.createSign( 'RSA-SHA256' );
		sigCreation.update( payload );
		payload += '\n' + sigCreation.sign( key, 'base64' );

		// Finally store the payload data
		this._payload = payload;

	}

	get payload() { return this._payload; }

	toString() { return this._payload; }

}


// Expose the definition class
module.exports = DefinitionSource;

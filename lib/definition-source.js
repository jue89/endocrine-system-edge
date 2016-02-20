"use strict";

const crypto = require( 'crypto' );
const jsonGate = require( 'json-gate' );

const definitionSchema = require( './definition-schema.js' );
const Definition = require( './definition.js' );



class DefinitionSource  extends Definition {

	constructor( key, definition ) {

		super();

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

		// Finally store the payload and data
		this._payload = payload;
		this._data = definition;

	}

}


// Expose the definition class
module.exports = DefinitionSource;

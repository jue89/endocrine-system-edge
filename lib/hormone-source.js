"use strict";

let crypto = require( 'crypto' );
let jsonGate = require( 'json-gate' );

let DefinitionSource = require( './definition-source.js');



class HormoneSource {

	constructor( key, definition, data ) {

		// Make sure we have a private key
		if( ! key ) {
			throw new Error( "No private key is given" );
		}

		if( ! ( definition instanceof DefinitionSource ) ) {
			throw new Error( "Given definition is not vaild" );
		}

		// Check if data is valid. If it is invalid, an error will be thrown
		if( typeof data != 'object' ) data = {};
		definition.inputDataSchema.validate( data );

		// Fetch timestamp
		let timestamp = Math.floor( Date.now() / 1000 );

		// Create a signature
		let sigCreation = crypto.createSign( 'RSA-SHA256' );

		// Create payload
		let payload = timestamp.toString();
		sigCreation.update( payload );
		definition.data.dataFormat.forEach( ( item ) => {
			let line;
			switch( item.type ) {
				case 'string':  line = data[ item.name ]; break;
				case 'number':  line = data[ item.name ].toString(); break;
				case 'boolean': line = data[ item.name ] ? '1' : '0';
			}
			payload += '\n' + line;
			sigCreation.update( line );
		} );
		payload += '\n' + sigCreation.sign( key, 'base64' );

		// Finally store the payload data, definition and timestamp
		this._payload = payload;
		this._definition = definition;
		this._timestamp = timestamp;

	}

	get payload() { return this._payload; }

	get isFresh() {

		let freshness = this._definition.data.freshness;
		if( ! freshness ) return true;

		let now = Math.floor( Date.now() / 1000 );

		return (now - this._timestamp - freshness) <= 0;

	}

}


// Expose the hormoneclass
module.exports = HormoneSource;

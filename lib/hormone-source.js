"use strict";

let crypto = require( 'crypto' );
let jsonGate = require( 'json-gate' );

let time = require( './time.js' );
let Hormone = require( './hormone.js' );
let DefinitionSource = require( './definition-source.js');



class HormoneSource extends Hormone {

	constructor( key, definition, data ) {

		super();

		// Check environment:
		// Make sure we have a private key
		if( ! key ) {
			throw new Error( "No private key is given" );
		}
		// The definition must be an instanceof of the DefinitionSource class!
		if( ! ( definition instanceof DefinitionSource ) ) {
			throw new Error( "Given definition is not vaild" );
		}
		// Check if data is valid. If it is invalid, an error will be thrown
		if( typeof data != 'object' ) data = {};
		definition.inputDataSchema.validate( data );

		// Process data:
		// Fetch timestamp
		let timestamp = time.now();

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


		// Finally store all data
		this._payload = payload;
		this._data = data;
		this._definition = definition;
		this._timestamp = timestamp;

	}

}


// Expose the hormoneclass
module.exports = HormoneSource;

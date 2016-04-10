"use strict";

const jsonGate = require( 'json-gate' );
const pem = require( './pem.js' );


// Definition class is exteneded by DefinitionSink and DefinitionSource class
// The specialised classes just houses the constructor. The class methods are
// implemented here.

class Definition {

	get dataSchema() {

		if( ! this._dataSchema ) {
			// Create an input data check schema on the fly
			// The input object must have the defined properties with the defined type
			let properties = {};
			this._data.dataFormat.forEach( ( field ) => {
				properties[ field.name ] = {
					type: field.type,
					required: true
				};
			} );

			this._dataSchema = jsonGate.createSchema( {
				type: 'object',
				additionalProperties: false,
				properties: properties
			} );
		}

		return this._dataSchema;

	}

	get dataFormat() {

		if( ! this._dataFormat ) {

			this._dataFormat = {};

			for( let i of this._data.dataFormat ) {

				// Fill format info
				this._dataFormat[ i.name ] = {
					type: i.type,
					unit: i.unit ? i.unit.toString() : null,
					description: i.description ? i.description.toString() : null,
				};

			}

		}

		return this._dataFormat;

	}

	get payload() { return this._payload; }

	get data() { return this._data; }

	toString() { return this._payload; }

	getOrigin() {

		// If the data is available, just return it
		if( this._origin ) return Promise.resolve( this._origin );

		// Otherwise get information
		return pem.readCertificateInfo( this._data.cert ).then( ( info ) => {

			// Cache info
			this._origin = info;

			return info;

		} );

	}

	checkCertChain( ca ) {

		// Check the cert against given CA
		return pem.verifySigningChain( this._data.cert, ca );

	}

}


module.exports = Definition;

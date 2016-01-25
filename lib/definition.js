"use strict";

let jsonGate = require( 'json-gate' );


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
				}
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

}


module.exports = Definition;

"use strict";

let events = require( 'events' );
let jsonGate = require( 'json-gate' );

let DefinitionSource = require( './definition-source.js' );
let HormoneSource = require( './hormone-source.js' );


// The hormone names must not start or end with '/' and must not be empty
let nameSchema = jsonGate.createSchema( {
	type: 'string',
	pattern: '^[^/]+.*[^/]+$'
} );


class Source extends events.EventEmitter {

	constructor( es, name, definitionData ) {

		super();

		// TODO: Check instance of es

		// Make sure the name is valid
		if( typeof name != 'string' ) name = '';
		nameSchema.validate( name );

		// Default for definitionData
		if( typeof definitionData !== 'object' ) definitionData = {};

		// Extract the auto refresh option.
		// It is not allowed in the hormone definition.
		let autoRefresh = definitionData.autoRefresh ? true : false;
		delete definitionData.autoRefresh;

		// Add the own cert to the definition
		definitionData.cert = es._cert;

		// Create new definition
		// If the definition data is invalid, everything will blow up at this point
		let definition = new DefinitionSource( es._key, definitionData );

		// Store all data
		this._name = name;
		this._definition = definition;
		this._es = es;

		// Publish definition:
		// Remove anything that might be still exist
		Promise.all( [
			es._publish( 'hormone/' + name, '' ),
			es._publish( 'definition/' + name, '' )
		] ).then( () => {

			// Send new definition data
			return es._publish( 'definition/' + name, definition.payload );

		} ).then( () => {

			// Report, that we successfully defined ourself
			this.emit( 'defined', this );

			// Install auto refresh
			if( autoRefresh && definitionData.freshness ) {
				this._autoRefresh = setInterval( () => {

					if( definitionData.dataFormat.length == 0 ) {
						// If the gland do not require any data, just send empty hormone
						return this.send( {} );
					} else if( this._lastData ) {
						// Otherwise send data if we know any
						this.send( this._lastData );
					}

				}, definitionData.freshness * 1000 / 2 )
			}

		} ).catch( ( err ) => {

			// Send error to all listeners
			this.emit( 'error', err );

		} );

	}

	destroy() {

		// Stop auto refresh if it has been started at creation
		if( this._autoRefresh ) clearInterval( this._autoRefresh );

		// Remove anything
		return Promise.all( [
			this._es._publish( 'definition/' + this._name, '' ),
			this._es._publish( 'hormone/' + this._name, '' )
		] ).then( () => {

			// Report that the gland has been destroyed
			this.emit( 'destroyed' );

		} );

	}

	send( data ) {

		// Create new Hormone
		let hormone = new HormoneSource( this._es._key, this._definition, data );

		// Store the data
		this._lastData = data;

		// Send payload and return promise
		return this._es._publish( 'hormone/' + this._name, hormone.payload ).then( () => {

			// We emitted a hormone \o/
			this.emit( 'sent', hormone );

		} );

	}

}


module.exports = Source;

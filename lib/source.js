"use strict";

const jsonGate = require( 'json-gate' );

const Events = require( './events.js' );
const DefinitionSource = require( './definition-source.js' );
const HormoneSource = require( './hormone-source.js' );


// The hormone names must not start or end with '/' and must not be empty
const nameSchema = jsonGate.createSchema( {
	type: 'string',
	pattern: '^[^/$][^#\+]*[^/]$'
} );


class Source extends Events {

	constructor( es, name, definitionData ) {

		super();

		let EndocrineSystem = require( './es.js' );
		if( ! ( es instanceof EndocrineSystem ) ) {
			throw new Error( "Given es is not vaild" );
		}

		// Make sure the name is valid
		if( typeof name != 'string' ) name = '';
		nameSchema.validate( name );

		// Default for definitionData
		if( typeof definitionData !== 'object' ) definitionData = {};

		// Extract the auto refresh option. If it is not defined, set it true by default
		if( definitionData.autoRefresh === undefined ) definitionData.autoRefresh = true;
		// Also set freshness to default value of 2h
		if( definitionData.freshness === undefined ) definitionData.freshness = 7200;
		if( definitionData.autoRefresh && definitionData.freshness ) {
			this._autoRefresh = parseInt( definitionData.freshness ) * 1000 / 2;
		} else {
			this._autoRefresh = 0;
		}
		// It is not allowed in the hormone definition -> delete!
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
			return this._emitDefinition();

		} ).then( () => {

			// Report, that we successfully defined ourself
			this._emitDefinitionEvent( 'newGland', name, definition );

			// Install the definition refresh cycle
			// Since broker may remove retained messages after a certain time, we
			// have to emit the definition periodically
			this._definitionRefresh = setInterval( () => {
				this._emitDefinition();
			}, es._definitionResendInterval * 1000 );

			// Install auto refresh
			if( this._autoRefresh ) setTimeout(
				() => this.send(),
				this._autoRefresh
			);

		} ).catch( ( err ) => {

			// Send error to all listeners
			this._emitDefinitionEvent( 'error', name, definition, err );

		} );

	}

	shutdown() {

		// Clear definition resend interval
		clearInterval( this._definitionRefresh );

		// Stop auto refresh if it is pending
		if( this._autoRefreshTimeout ) clearTimeout( this._autoRefreshTimeout );

		// Remove anything
		return Promise.all( [
			this._es._publish( 'definition/' + this._name, '' ),
			this._es._publish( 'hormone/' + this._name, '' )
		] ).then( () => {

			// Report that the gland has been shut down
			this._emitDefinitionEvent( 'removedGland', this._name, this._definition );

			// TODO: Just removing all listeners is not really clean. But it is better
			// than just keep the listeners attached to this instance and thus create
			// beautiful memory leaks.
			setImmediate( () => this.removeAllListeners() );

		} );

	}

	send( data ) {

		// If the gland do not require any data, just send an empty hormone
		if( data === undefined ) {
			if( this._definition.data.dataFormat.length === 0 ) {
				data = {};
			} else {
				return Promise.reject( new Error( "Cannot resend last data" ) );
			}
		}

		// Stop pending auto refresh timeouts
		if( this._autoRefreshTimeout ) clearTimeout( this._autoRefreshTimeout );

		// Create new Hormone
		let hormone = new HormoneSource( this._es._key, this._definition, data );

		// Send payload and return promise
		return this._es._publish( 'hormone/' + this._name, hormone.payload ).then( () => {

			// Set auto refresh timeout
			if( this._autoRefresh ) this._autoRefreshTimeout = setTimeout( () => {
				// Resend data
				this.send( data );
			}, this._autoRefresh );

			// We emitted a hormone \o/
			this._emitHormoneEvent( 'sentHormone', this._name, hormone );

		} );

	}

	_emitDefinition() {

		// Send definition data
		return this._es._publish(
			'definition/' + this._name,
			this._definition.payload
		);

	}

}


module.exports = Source;

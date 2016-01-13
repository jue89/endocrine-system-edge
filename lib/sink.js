"use strict";

let events = require( 'events' );
let jsonGate = require( 'json-gate' );

let pem = require( './pem.js' );
let DefinitionSink = require( './definition-sink.js' );
let HormoneSink = require( './hormone-sink.js' );


// The hormone names must not start or end with '/' and must not be empty
let nameSchema = jsonGate.createSchema( {
	type: 'string',
	pattern: '^[^/]+.*$'
} );

let definitionRE = /^definition\/(.*)$/;
let hormoneRE = /^hormone\/(.*)$/;


class Sink extends events.EventEmitter {

	constructor( es, filter, certCheck ) {

		super();

		// TODO: Check es

		this._es = es;
		this._filter = filter;
		this._certCheck = certCheck;

		// Create some stores ...
		this._subscriptions = {}; // Received definitions and subscribed hormones
		this._hormones = {};      // Last received hormone by name

		// Subscribe to defintion messages
		es._subscribe( 'definition/' + filter, ( topic, payload ) => {
			this._receivedDefinition( topic, payload );
		} );

	}

	destroy() {

		// Unsubscribe definition topic
		this._es._unsubscribe( 'defintion/' + this._filter );

		// TODO: Stop all timeouts

		// Unsubscribe all hormone topics
		for( let name in this._subscriptions ) {
			this._es._unsubscribe( 'hormone/' + name );
		}

	}

	_receivedDefinition( topic, payload ) {

		// Extract name
		let tmp = definitionRE.exec( topic );
		if( ! tmp ) {
			return this.emit( 'receiveError', new Error( "Received no definition" ) );
		}
		let name = tmp[ 1 ];

		// The payload decides what to do
		if( payload == '' ) {
			// Remove hormone source
			this._removeHormoneSource( name );
		} else {
			// Add hormone source
			this._addHormoneSource( name, payload );
		}

	}

	_addHormoneSource( name, payload ) {

		try {
			// Create new definition from payload
			// Makes sure the format and signature are vaild
			let definition = new DefinitionSink( payload );
		} catch( err ) {
			this.emit( 'receiveError', err );
		}

		// Check the certificate
		let data = definition.data;
		Promise.all( [
			pem.verifySigningChain( data.cert, this._es._ca ),
			pem.readCertificateInfo( data.cert )
		] ).then( ( results ) => {

			// Is cert signed by CA?
			if( ! results[0] ) {
				throw new Error( "Certificate has not been signed by CA" );
			}

			// Is the cert still valid?
			// First get current time. If we have an ESdummy, read time from es.
			// Otherwise get the current time from the OS
			let now = this._es.trustMeImAnEngineer ? this._es._now : Date.now();
			if( results[1].validity.start > now ) {
				throw new Error( "Certificate is valid in the future" );
			}
			if( results[1].validity.end < now ) {
				throw new Error( "Certificate has been expired" );
			}

			// Own check function
			if( typeof this._certCheck == 'function' ) {
				// The check function my return a promise, a value (-> everything is
				// ok) or throws an error
				return this._certCheck( name, results[ 1 ] );
			}

		} ).then( () => {

			// If the hormone is known, remove the old one first
			this._removeHormoneSource( name );

			// Subscribe to hormone
			this._es._subscribe( 'hormone/' + name, ( topic, payload ) => {

				// Skip empty messages
				if( payload == '' ) return;

				// Hand over hormone to handler
				this._receivedHormone( topic, payload );

			} );

			// Store handle
			this._subscriptions[ name ] = definition;

			// Report that we started listening to hormones
			this.emit( 'subscribe', name, definition );

		} ).catch( ( err ) => {
			this.emit( 'receiveError', err );
		} );

	}

	_removeHormoneSource( name ) {

		// Check if we know the hormone source that shall be removed
		if( ! this._subscriptions[ name ] ) return this.emit(
			'receiveError',
			new Error( "Received unkown definition removal" )
		);

		// Unsubscribe hormone
		this._es._unsubscribe( 'hormone/' + name );

		// Remove subscription and last hormone
		delete this._subscriptions[ name ];
		delete this._hormones[ name ];

	}

	_receivedHormone( topic, payload ) {
		try {

			// Extract name
			let tmp = hormoneRE.exec( topic );
			if( ! tmp ) throw new Error( "Received no hormone" );
			let name = tmp[ 1 ];

			// Check if we have a definition for the received hormone
			if( ! this._subscriptions[ name ] ) throw new Error( "Received unkown hormone" );

			// Interprete hormone
			let hormone = new HormoneSink( this._subscriptions[ name ], payload );

			// At this point the hormone is okay :) At least the signature
			// TODO: Check freshness
			// TODO: Set expire timeout
			// TODO: Check error
			console.log( hormone.data );

			this._hormones[ name ] = hormone;

		} catch( err ) {
			this.emit( 'receiveError', err );
		}
	}

}


module.exports = Sink;

"use strict";

let events = require( 'events' );
let jsonGate = require( 'json-gate' );

let pem = require( './pem.js' );
let time = require( './time.js' );
let DefinitionSink = require( './definition-sink.js' );
let HormoneSink = require( './hormone-sink.js' );


// The hormone names must not start or end with '/' and must not be empty
let nameSchema = jsonGate.createSchema( {
	type: 'string',
	pattern: '^[^/].*$'
} );

let definitionRE = /^definition\/(.*)$/;
let hormoneRE = /^hormone\/(.*)$/;


// Helper function for equality checking of objects
function deepEqual( a, b ) {
	if( typeof a != 'object' || typeof b != 'object' ) return a === b;

	// Get all keys of a
	let keys = Object.keys( a );

	// Go through b and search for the keys in a
	let foundKeys = 0;
	for( let key in b ) {
		if( keys.indexOf( key ) == -1 ) return false;
		foundKeys++;
	}

	// Check if the number of found keys is identical to the number of
	// keys in a
	if( foundKeys != keys.length ) return false;

	// We got here if all keys are matching. Now check their content
	for( let k of keys ) {
		// Check values
		if( ! deepEqual( a[k], b[k] ) ) return false;
	}

	// Nothing has stopped us from getting here ...
	return true;
}


class Sink extends events.EventEmitter {

	constructor( es, filter, certCheck ) {

		super();

		let EndocrineSystem = require( './es.js' );
		if( ! ( es instanceof EndocrineSystem ) ) {
			throw new Error( "Given es is not vaild" );
		}
		this._es = es;

		// Check given filter
		if( typeof filter != 'string' ) {
			throw new Error( "Filter must be a string" );
		}
		nameSchema.validate( filter );
		this._filter = filter;

		// If the cert check is given an not a function, complain about it
		if( certCheck !== undefined && typeof certCheck != 'function' ) {
			throw new Error( "Given cert check is not a function" );
		}
		this._certCheck = certCheck;

		// Create some stores ...
		this._subscriptions = {}; // Received definitions and subscribed hormones
		this._hormones = {};      // Last received hormone by name

		// Subscribe to defintion messages
		es._subscribe( 'definition/' + filter, ( topic, payload ) => {
			this._receivedDefinition( topic, payload );
		} ).catch( ( err ) => {
			this.emit( 'error', err );
		} );

	}

	destroy() {

		// Unsubscribe definition topic
		return this._es._unsubscribe( 'definition/' + this._filter ).then( () => {

			let unsubJobs = [];

			// Unsubscribe all hormones
			for( let name in this._subscriptions ) {
				unsubJobs.push( this._removeHormoneSource( name ) );
			}

			// Wait for all unsubscriptions to be done
			return Promise.all( unsubJobs );

		});

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
			this._removeHormoneSource( name ).catch( ( err ) => {
				this.emit( 'receiveError', err );
			} );
		} else {
			// Add hormone source
			this._addHormoneSource( name, payload ).catch( ( err ) => {
				this.emit( 'receiveError', err );
			} );
		}

	}

	_addHormoneSource( name, payload ) {

		// Store for definition data
		let definition;

		return new Promise( ( resolve ) => {

			// Create new definition from payload
			// Makes sure the format and signature are vaild
			definition = new DefinitionSink( payload );

			// At this point the payload was readable and okay
			resolve();

		} ).then( () => {

			// Check the certificate
			let data = definition.data;
			return Promise.all( [
				pem.verifySigningChain( data.cert, this._es._ca ),
				pem.readCertificateInfo( data.cert )
			] )

		} ).then( ( results ) => {

			// Is cert signed by CA?
			if( ! results[0] ) {
				throw new Error( "Certificate has not been signed by CA" );
			}

			// Is the cert still valid?
			// First get current time. If we have an ESdummy, read time from es.
			// Otherwise get the current time from the OS
			let now = time.now();
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

			// If the hormone is known, check if anything has changed
			if( this._subscriptions[ name ] ) {

				let former = this._subscriptions[ name ].data;
				let received = definition.data;

				if( ! deepEqual( former, received ) ) {
					// Something changed -> Remove the old hormone
					return this._removeHormoneSource( name );
				}

			}

		} ).then( () => {

			// Subscribe to hormone if no subscription exists.
			// If the definition is known and hasn't removed in the former step, wo do
			// not need to do anything here since we are already listening for hormones
			if( ! this._subscriptions[ name ] ) {

				return this._es._subscribe( 'hormone/' + name, ( topic, payload ) => {
					// Skip empty messages
					if( payload == '' ) return;
					// Hand over hormone to handler
					this._receivedHormone( topic, payload );
				} );

			}

		} ).then( () => {

			if( ! this._subscriptions[ name ] ) {

				// Store handle if no subscription is present
				this._subscriptions[ name ] = definition;

				// Report that we started listening to hormones
				this.emit( 'subscribe', name, definition );

			} else {

				// Report that we received the same defintion again
				this.emit( 'refresh', name, definition );

			}

		} );

	}

	_removeHormoneSource( name ) {

		// Check if we know the hormone source that shall be removed
		if( ! this._subscriptions[ name ] ) {
			return Promise.reject( new Error( "Received unkown definition removal" ) );
		}

		// Unsubscribe hormone
		return this._es._unsubscribe( 'hormone/' + name ).then( () => {

			// Remove timeout if it is pending
			if( this._hormones[ name ] && this._hormones[ name ].timeout ) {
				clearTimeout( this._hormones[ name ].timeout );
			}

			// Remove subscription and last hormone
			delete this._subscriptions[ name ];
			delete this._hormones[ name ];

			// Emit an event
			this.emit( 'unsubscribe', name );

		} );

	}

	_receivedHormone( topic, payload ) {
		try {

			// Extract name
			let tmp = hormoneRE.exec( topic );
			if( ! tmp ) throw new Error( "Received no hormone" );
			let name = tmp[ 1 ];

			// Check if we have a definition for the received hormone
			if( ! this._subscriptions[ name ] ) throw new Error( "Received unkown hormone" );

			// Check if we received a duplicate
			if( this._hormones[ name ] && this._hormones[ name ].hormone.payload == payload ) return;

			// Interprete hormone
			let hormone = new HormoneSink( this._subscriptions[ name ], payload );

			// At this point the hormone is okay :) At least the signature.

			// Keep the current timestamp
			let receivedAt = time.now();

			// If this is the first hormone we recieved under this name, make sure we
			// have at least some dummy data to compare with
			let formerHormone = this._hormones[ name ] ? this._hormones[ name ] : {
				isFresh: true,
				err: 0,
				timeout: null,
				stateChangedAt: time.now()
			} ;

			// Stop expiration timeout if present
			if( formerHormone.timeout ) clearTimeout( formerHormone.timeout );

			// Further checks:
			let stateChanged = false;
			// - Freshness
			let isFresh = hormone.isFresh;
			if( isFresh && ! formerHormone.isFresh ) {
				// The expired hormone went fresh -> tell the good news!
				this.emit( 'hormoneRefresh', name, hormone );
				stateChanged = true;
			} else if( ! isFresh && formerHormone.isFresh ) {
				// The received hormone has expired!
				this.emit( 'hormoneExpired', name, hormone );
				stateChanged = true;
			}
			// - Error
			let err = hormone.error;
			if( err == 0 && formerHormone.err != err ) {
				// The hormone reported recovery
				this.emit( 'hormoneRecover', name, hormone );
				stateChanged = true;
			} else if( err > 0 && formerHormone.err != err ) {
				// Some error occured!
				this.emit( 'hormoneError', name, hormone );
				stateChanged = true;
			}

			// If the hormone is fresh, set an expire timeout
			let timeout = null;
			if( isFresh ) timeout = setTimeout( () => {
				// The hormone just expired!
				this._hormones[ name ].isFresh = false;
				this._hormones[ name ].timeout = null;
				this.emit( 'hormoneExpired', name, hormone );
			}, hormone.freshness * 1000 );

			// Store all hormone related data
			this._hormones[ name ] = {
				receivedAt: receivedAt,
				stateChangedAt: stateChanged ? receivedAt : formerHormone.stateChangedAt,
				hormone: hormone,
				isFresh: isFresh,
				err: err,
				timeout: timeout
			};

			// Tell the user we got a new hormone
			this.emit( 'hormone', name, hormone );

		} catch( err ) {
			this.emit( 'receiveError', err );
		}

	}

	_fetchHormones( cond ) {
		if( typeof cond !== 'object' ) cond = {};

		// Copy all hormones into an array
		let hormones = [];
		for( let name in this._hormones ) {
			let h = this._hormones[ name ];

			// First we assume that the hormone is part of the required set
			let add = true;

			// Check conditions. If a condition is not met, add is set false
			// - A certain freshness is required
			if( cond.isFresh !== undefined && h.isFresh !== cond.isFresh ) {
				add = false
			}
			// - The hormone error state is interesting
			if( cond.err !== undefined ) {
				if( cond.err && h.err <= 0 ) {
					add = false;
				} else if( ! cond.err && h.err > 0 ) {
					add = false;
				}
			}

			// If no show stopper occured, add the hormone to the set
			if( add ) hormones.push( {
				name: name,
				sentAt: h.hormone.timestamp,
				receivedAt: h.receivedAt,
				stateChangedAt: h.stateChangedAt,
				data: h.hormone.data,
				dataFormat: h.hormone.definition.dataFormat,
				err: h.err,
				isFresh: h.isFresh
			} );

		}

		return hormones;

	}

	get hormones() { return this._fetchHormones( {} ); }
	get expiredHormones() { return this._fetchHormones( { isFresh: false } ); }
	get errorHormones() { return this._fetchHormones( { err: true } ); }
	get goodHormones() { return this._fetchHormones( { err: false, isFresh: true } ); }

}


module.exports = Sink;

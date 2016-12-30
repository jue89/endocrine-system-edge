"use strict";

const events = require( 'events' );
const jsonGate = require( 'json-gate' );
const mqtt = require( 'mqtt' );

const pem = require( './pem.js' );
const time = require( './time.js' );
const Source = require( './source.js' );
const Sink = require( './sink.js' );

// States of the ES
const S_DISCONNECTED     = 0; // 000
const S_BROKER_DISCOVERY = 1; // 001
const S_CONNECTING       = 2; // 010
const S_RECONNECTING     = 3; // 011
const S_CONNECTED        = 4; // 100
const S_DISCONNECTING    = 5; // 101

const optionSchema = jsonGate.createSchema( {
	type: 'object',
	properties: {
		cert: {
			type: 'string',
			required: true
		},
		key: {
			type: 'string',
			required: true
		},
		ca: {
			type: 'string',
			required: true
		},
		core: {
			required: true
		},
		prefix: {
			type: 'string',
			default: ''
		},
		ignoreTimedrift: {
			type: 'boolean',
			default: false
		},
		rejectUnauthorized: {
			type: 'boolean',
			default: true
		},
		definitionResendInterval: {
			type: 'number',
			minimum: 60,
			default: 21600 // 6h
		},
		reconnectTimeout: {
			type: [ 'number', 'null' ],
			minimum: 0,
			default: 30
		}
	},
	additionalProperties: false
} );


class EndocrineSystem extends events.EventEmitter {

	constructor( options ) {

		super();

		// Prepare some stores
		this._state = S_DISCONNECTED;
		this._subscriptions = [];
		this._glands = [];
		this._receptors = [];

		// First check all options and then connect to the broker
		this._brokerPromise = this._processOptions( options ).then( () => this._connect() );

	}

	_processOptions( options ) {

		// Make sure all required options are stated
		if( options === undefined ) options = {};
		optionSchema.validate( options );

		// Store option data
		// - PKI information
		this._key = options.key;
		this._cert = options.cert;
		this._ca = options.ca;
		// - Core discovery
		if( ! ( options.core instanceof Array ) ) options.core = [ options.core ];
		options.core.forEach( ( item ) => {
			let type = typeof item;
			if( type != 'string' && type != 'function' ) {
				throw new Error( "Invalid core discovery method. Allowed types: string, function returning promise." );
			}
		} );
		this._coreDiscovery = options.core;
		delete options.core;
		// - Prefix for published hormones
		this._prefix = options.prefix;
		delete options.prefix;
		// - Timedrift things
		this._ignoreTimedirft = options.ignoreTimedrift;
		delete options.ignoreTimedrift;
		// - definitionResendInterval
		this._definitionResendInterval = options.definitionResendInterval;
		delete options.definitionResendInterval;
		this._reconnectTimeout = options.reconnectTimeout;
		delete options.reconnectTimeout;
		// - MQTT-related options: Always start a clean session
		options.clean = true;
		// - Do not check server identity. The server name varies by discover method
		options.checkServerIdentity = function() { return; };
		// - The option object itself for MQTT
		this._mqttOptions = options;


		// Test all provided PKI data
		return Promise.all( [
			pem.getModulus( options.key ),
			pem.getModulus( options.cert ),
			pem.verifySigningChain( options.cert, options.ca ),
			pem.getFingerprint( options.ca )
		] ).then( ( result ) => {

			// Do key and cert match?
			if( result[0].modulus != result[1].modulus ) {
				throw new Error( "Key and certificate do not match" );
			}

			// Is cert signed by CA?
			if( ! result[2] ) {
				throw new Error( "Certificate has not been signed by CA" );
			}

			// Store CA fingerprint
			this._caFingerprint = result[3];

			// Check the local time drift
			if( this._ignoreTimedirft ) return 0.0;
			else return time.getDrift();

		} ).then( ( drift ) => {

			// Make sure the drift is small enough
			if( drift < 0.0 ) drift *= -1;
			if( drift > 10000.0 ) {
				throw new Error( "The time drift is too large" );
			}

		} );

	}

	_forwardEvent( emitter, eventName ) {
		if( eventName instanceof Array ) {
			eventName.forEach( ( e ) => this._forwardEvent( emitter, e ) );
		} else {
			let self = this;
			emitter.on( eventName, function() {
				self.emit.apply(
					self,
					[ eventName ].concat( Array.prototype.slice.call( arguments ) )
				);
			} );
		}
	}

	_discover() {

		this._state = S_BROKER_DISCOVERY;

		// Kick off discovery
		return discover( this._caFingerprint, this._coreDiscovery, 0 );

		function discover( fingerprint, methods, index ) {

			// We reached the end of methods start over again
			if( index == methods.length ) index = 0;

			// If the method is a string, just resolve the string
			if( typeof methods[ index ] == 'string' ) {
				return Promise.resolve( methods[ index ] );
			}

			// Otherwise try discovery
			return methods[ index ]( fingerprint ).catch( () => {
				return discover( fingerprint, methods, index + 1 );
			} );

		}

	}

	_connect() {

		return this._discover().then( ( url ) => new Promise( ( resolve ) => {

			this._state = S_CONNECTING;

			let broker = mqtt.connect( url, this._mqttOptions );

			this.emit( 'connecting', {
				url: url
			} );

			// Set event handlers:
			// - Passthrough error events
			broker.on( 'error', ( err ) => {
				this.emit( 'error', err, {
					url: url
				} );
			} );
			// - Messages
			broker.on( 'message', ( topic, message ) => {

				// Find receipient
				for( let s of this._subscriptions ) {
					if( s === undefined ) continue;
					// Call handler if topic matches
					if( s.topicRE.test( topic ) ) s.handler( topic, message.toString() );
				}

			} );
			// - Connection
			//   The connect event may occurs several times, if the connection get
			//   get lost and the reconnection process cannot rerecognise this client
			broker.on( 'connect', () => {

				// Resubscribe topics
				for( let topic in this._subscriptions ) {
					broker.subscribe( topic, { qos: 1 } );
				}

				switch( this._state ) {

					case S_CONNECTING: // We connected for the very first time
						this._state = S_CONNECTED;

						// Resolve the broker promise
						resolve( broker );

						this.emit( 'online', {
							url:url
						} );

						break;

					case S_RECONNECTING: // The broker is reachable again
						this._state = S_CONNECTED;

						// Kill existing reconnect timeouts
						if( this._reconnectTimeoutHandle ) clearTimeout( this._reconnectTimeoutHandle );

						this.emit( 'online', {
							url:url
						} );

						break;

				}

			} );
			// - Reconnect
			//   Try to reconnect to the broker
			broker.on( 'reconnect', () => {} );
			// - Close
			//   Fired if we lose connection to the broker
			broker.on( 'close', () => {

				// We are offline now. Why?
				switch( this._state ) {

					case S_CONNECTED: // We are offline unintentionally
						this.emit( 'offline', {
							url:url
						} );

						// break is missing because the following should be executed as well
						/* falls through */

					case S_CONNECTING: // We are offline unintentionally
						this._state = S_RECONNECTING;

						// In the case we want to rediscover the core we start the reconnect
						// timer that kills the current mqtt instance and starts a new one.
						// This is useful if we want to connect to a different broker that may
						// occured in the meantime.
						if( this._reconnectTimeout ) this._reconnectTimeoutHandle = setTimeout( () => {

							// Remove timeout instance
							delete this._reconnectTimeoutHandle;

							// Kill current broker
							broker.end();

							// Create a new broker instance
							this._brokerPromise = this._connect();

						}, this._reconnectTimeout * 1000 );

						break;

					case S_DISCONNECTING: // We are willing to disconnect
						this._state = S_DISCONNECTED;

						this.emit( 'offline', {
							url:url
						} );

						break;

				}

			} );
			// - Disconnect
			broker.on( 'offline', () => {} );

		} ) );

	}

	_publish( topic, message ) {

		// Get the broker handle
		return this._brokerPromise.then( ( broker ) => {

			return new Promise( ( resolve, reject ) => {
				broker.publish( topic, message, { qos: 1, retain: true }, () => resolve() );
			} );

		} );

	}

	_subscribe( topic, handler ) {

		// Create subscription handler
		let topicRE = topic.replace( /\+/g, '[^/]*' ).replace( /#/g, '.*' );
		let subHandler = {
			topic: topic,
			topicRE: new RegExp( '^' + topicRE + '$' ),
			handler: handler
		};

		// Loopup whether the topic has alread subscribed or not
		let found = false;
		for( let s of this._subscriptions ) {
			if( s === undefined ) continue;
			if( s.topic === topic ) {
				found = true;
				break;
			}
		}

		// Append handler to subscriptions list
		let handle = this._subscriptions.push( subHandler ) - 1;

		// If the topic has already been subscribed, we do not need to subscribe
		// it again at the broker. Otherwise, we subscribe it.
		if( found ) return Promise.resolve( handle );
		else return this._brokerPromise.then( ( broker ) => {
			return new Promise( ( resolve, reject ) => {
				broker.subscribe( topic, { qos: 1 }, ( err ) => {
					if( err ) reject( err );
					else resolve( handle );
				} );
			} );
		} );

	}

	_unsubscribe( handle ) {

		// Get the handler
		let subHandler = this._subscriptions[ handle ];

		// Don't forget about the idiots - since its an internal function this is
		// probably me and myself - who pass bad handles over.
		if( subHandler === undefined ) return Promise.reject( new Error( "Unknown subscription handle" ) );

		// Remove handler from subscriptions
		delete this._subscriptions[ handle ];

		// Check whether other handles are listening to the same topicRE
		let found = false;
		for( let s of this._subscriptions ) {
			if( s === undefined ) continue;
			if( s.topic === subHandler.topic ) {
				found = true;
				break;
			}
		}

		// If others are listening as well, we finished our job here. Otherwise we
		// must unsubscribe from that topic
		if( found ) return Promise.resolve();
		else return this._brokerPromise.then( ( broker ) => {
			broker.unsubscribe( subHandler.topic );
		} );

	}

	get online() {

		// Check if the 3rd bit is 1
		return (this._state & 4) == 4;

	}

	newGland( name, definition ) {

		let gland = new Source( this, this._prefix + name, definition );
		this._forwardEvent( gland, [
			'newGland',
			'error',
			'removedGland',
			'sentHormone'
		] );
		this._glands.push( gland );
		return gland;

	}

	newReceptor( filter, certCheck ) {

		let receptor = new Sink( this, filter, certCheck );
		this._forwardEvent( receptor, [
			'newReceptor',
			'error',
			'removedReceptor',
			'receptionError',
			'defined',
			'refreshed',
			'undefined',
			'hormoneRefresh',
			'hormoneExpiration',
			'hormoneRecovery',
			'hormoneError',
			'hormone'
		] );
		this._receptors.push( receptor );
		return receptor;

	}

	shutdown() {

		let jobs = [];

		// Destory all glands and receptors
		this._glands.forEach( ( gland ) => {
			jobs.push( gland.shutdown() );
		} );
		this._receptors.forEach( ( receptor ) => {
			jobs.push( receptor.shutdown() );
		} );

		// Wait for all josb to be finished
		return Promise.all( jobs ).then( () => {
			return this._brokerPromise;
		} ).then( ( broker ) => {
			this._state = S_DISCONNECTING;
			// Close connection to broker
			new Promise( ( resolve, reject ) => {
				broker.end( () => resolve() );
			} );
		} );

	}

}


module.exports = EndocrineSystem;

"use strict";

const events = require( 'events' );
const jsonGate = require( 'json-gate' );
const mqtt = require( 'mqtt' );

const pem = require( './pem.js' );
const discover = require( './discover.js' );
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
		broker: {
			type: 'string',
			required: false
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
			default: 21600 // 6h
		}
	},
	additionalProperties: false
} );


class EndocrineSystem extends events.EventEmitter {

	constructor( options ) {

		super();

		// Prepare some stores
		this._state = S_DISCONNECTED;
		this._subscriptions = {};
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
		// - Prefix for published hormones
		this._prefix = options.prefix;
		delete options.prefix;
		// - Timedrift things
		this._ignoreTimedirft = options.ignoreTimedrift;
		delete options.ignoreTimedrift;
		// - definitionResendInterval
		this._definitionResendInterval = options.definitionResendInterval;
		delete options.definitionResendInterval;
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
			pem.verifySigningChain( options.cert, options.ca )
		] ).then( ( result ) => {

			// Do key and cert match?
			if( result[0].modulus != result[1].modulus ) {
				throw new Error( "Key and certificate do not match" );
			}

			// Is cert signed by CA?
			if( ! result[2] ) {
				throw new Error( "Certificate has not been signed by CA" );
			}

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

	_discover() {

		this._state = S_BROKER_DISCOVERY;

		// If the user stated a broker, just return its url
		if( typeof this._mqttOptions.broker == 'string' ) {
			return Promise.resolve( this._mqttOptions.broker );
		}

		// Otherwise we try to find one via mDNS
		return pem.getFingerprint( this._ca ).then( ( fingerprint ) => {

			// Try to find a broker
			return discover.mDNS( fingerprint );

		} );

	}

	_connect() {

		return this._discover().then( ( url ) => new Promise( ( resolve ) => {

			this._state = S_CONNECTING;

			let broker = mqtt.connect( url, this._mqttOptions );

			// Set event handlers:
			// - Passthrough error events
			broker.on( 'error', ( err ) => {
				this.emit( 'error', err );
			} );
			// - Messages
			broker.on( 'message', ( topic, message ) => {
				// Find receipient
				for( let s in this._subscriptions ) {
					let sub = this._subscriptions[ s ];

					// Call handler if topic matches
					if( sub.topicRE.test( topic ) ) sub.handler( topic, message.toString() );
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

				if( this._state === S_CONNECTING ) {
					// We connected for the very first time

					this._state = S_CONNECTED;
					resolve( broker );
					this.emit( 'online' );

				} else if( this._state === S_RECONNECTING ) {
					// The broker is reachable again

					// Kill existing reconnect timeouts
					if( this._reconnectTimeout ) clearTimeout( this._reconnectTimeout );

					this._state = S_CONNECTED;
					this.emit( 'online' );

				}

			} );
			// - Reconnect
			//   Try to reconnect to the broker
			broker.on( 'reconnect', () => {} );
			// - Close
			//   Fired if we lose connection to the broker
			broker.on( 'close', () => {

				// We are offline now. Why?
				if( this._state === S_CONNECTED ) {
					// We are offline unintentionally

					this._state = S_RECONNECTING;
					this.emit( 'offline' );

					// In the case we discover broker via mDNS, we also start a reconnect
					// timer that kills the current mqtt instance and starts a new one.
					// This is useful if we want to connect to a different broker that may
					// occured in the meantime.
					if( ! this._mqttOptions.broker ) this._reconnectTimeout = setTimeout( () => {

						// Remove timeout instance
						delete this._reconnectTimeout;

						// Kill current broker
						broker.end();

						// Create a new broker instance
						this._brokerPromise = this._connect();

					}, 10000 );

				} else if( this._state === S_DISCONNECTING ) {
					// We are willing to disconnect

					this._state = S_DISCONNECTED;
					this.emit( 'offline' );

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

		// Get the broker handle
		return this._brokerPromise.then( ( broker ) => {

			// Do we know any subscriptions related to the topic
			if( this._subscriptions[ topic ] ) return Promise.reject(
				new Error( "Subscription duplicate" )
			);

			return new Promise( ( resolve, reject ) => {
				broker.subscribe( topic, { qos: 1 }, ( err ) => {
					if( err ) return reject( err );

					// Generate new regular expression
					let topicRE = topic.replace( /\+/g, '[^/]*' ).replace( /#/g, '.*' );

					// Store regular expression and handler
					this._subscriptions[ topic ] = {
						topicRE: new RegExp( '^' + topicRE + '$' ),
						handler: handler
					};

					resolve();

				} );
			} );

		} );

	}

	_unsubscribe( topic ) {

		// Get the broker handle
		return this._brokerPromise.then( ( broker ) => {

			// Do we know any subscriptions related to the topic
			if( ! this._subscriptions[ topic ] ) return Promise.reject(
				new Error( "Unknown subscription" )
			);

			return new Promise( ( resolve, reject ) => {
				broker.unsubscribe( topic, () => {
					// Remove subscription handler
					delete this._subscriptions[ topic ];
					resolve();
				} );
			} );

		} );

	}

	get online() {
		// Check if the 4th bit is 1
		return (this._state & 4) == 4;
	}

	newGland( name, definition ) {

		let gland = new Source( this, this._prefix + name, definition );
		// Passthrough errors
		gland.on( 'error', ( err ) => {
			this.emit( 'error', err );
		} );
		this._glands.push( gland );
		return gland;

	}

	newReceptor( filter, certCheck ) {

		let receptor = new Sink( this, filter, certCheck );
		// Passthrough errors
		receptor.on( 'error', ( err ) => {
			this.emit( 'error', err );
		} );
		this._receptors.push( receptor );
		return receptor;

	}

	destroy() {

		let jobs = [];

		// Destory all glands and receptors
		this._glands.forEach( ( gland ) => {
			jobs.push( gland.destroy() );
		} );
		this._receptors.forEach( ( receptor ) => {
			jobs.push( receptor.destroy() );
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

"use strict";

let events = require( 'events' );
let jsonGate = require( 'json-gate' );
let mqtt = require( 'mqtt' );

let pem = require( './pem.js' );
let time = require( './time.js' );
let Source = require( './source.js' );
let Sink = require( './sink.js' );


let optionSchema = jsonGate.createSchema( {
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
			required: true
		},
		prefix: {
			type: 'string',
			default: ''
		},
		ignoreTimedrift: {
			type: 'boolean',
			default: false
		}
	},
	additionalProperties: false
} );


class EndocrineSystem extends events.EventEmitter {

	constructor( options ) {

		super();

		// Make sure all required options are stated
		optionSchema.validate( options );

		// Extract URL
		let url = options.broker;
		delete options.broker;

		// Store option data
		this._key = options.key;
		this._cert = options.cert;
		this._ca = options.ca;
		this._prefix = options.prefix;
		this._ignoreTimedirft = options.ignoreTimedrift;

		// Prepare some stores
		this._online = false;
		this._subscriptions = {};
		this._glands = [];
		this._receptors = [];

		// Test all provided PKI data
		this._brokerPromise = Promise.all( [
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
			if( drift < 0 ) drift *= -1;
			if( drift > 10.0 ) {
				throw new Error( "The time drift is too large" );
			}

			// Connect to MQTT
			options.clean = true;
			let broker = mqtt.connect( url, options );

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
				// Store the current state
				this._online = true;
				// Tell the user we are online
				this.emit( 'online' );
			} );
			// - Reconnect
			//   Try to reconnect to the broker
			broker.on( 'reconnect', () => {} );
			// - Close
			//   Fired if we lose connection to the broker
			broker.on( 'close', () => {
				// We are offline now
				if( this._online ) {
					// If we weren't offline before, tell the user
					this._online = false;
					this.emit( 'offline' );
				}
			} );
			// - Disconnect
			broker.on( 'offline', () => {} );

			// Wait for the first connection
			return new Promise( ( resolve, reject ) => {
				broker.once( 'connect', () => resolve( broker ) );
			} )

		} );

	}

	_publish( topic, message ) {

		// Get the broker handle
		return this._brokerPromise.then( ( broker ) => {

			return new Promise( ( resolve, reject ) => {
				// TODO: If the broker rejects the message, he will simply disconnect
				broker.publish(
					topic,
					message,
					{ qos: 1, retain: true },
					resolve
				);
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
					let topicRE = '^'
					            + topic.replace( /\+/g, '[^/]*' ).replace( /#/g, '.*' )
					            + '$';

					// Store regular expression and handler
					this._subscriptions[ topic ] = {
						topicRE: new RegExp( topicRE ),
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

	get online() { return this._online; }

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
			// Close connection to broker
			new Promise( ( resolve, reject ) => {
				broker.end( () => resolve() );
			} );
		} );

	}

}


module.exports = EndocrineSystem;

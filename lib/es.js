"use strict";

let events = require( 'events' );
let jsonGate = require( 'json-gate' );
let mqtt = require( 'mqtt' );

let pem = require( './pem.js' );


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

		// Prepare some stores
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
			if( result[2] ) {
				throw new Error( "Certificate has not been signed by CA" );
			}

			// Connect to MQTT
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
					if( sub.topicRE( topic ) ) sub.handler( topic, message );
				}

			} );

			// Wait for a connection
			return new Promise( ( resolve, reject ) => {
				broker.once( 'connect', () => { resolve( broker ); } );
			} )

		} );

	}

	_publish( topic, message ) {

		// Get the broker handle
		return this._brokerPromise.then( ( broker ) => {

			return new Promise( ( resolve, reject ) => {
				// TODO: Timeout?
				// TODO: What happens if the broker rejects the message
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
				new Error("Subscription duplicate")
			);

			return new Promise( ( resolve, reject ) => {
				broker.subscribe( topic, ( err ) => {
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
				new Error("Unknown subscription")
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

	newGland( name, definition ) {

		let gland = new Source( this, name, definition );
		// Passthrough errors
		gland.on( 'error', ( err ) => {
			this.emit( 'error', err );
		} );
		this._glands.push( source );
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

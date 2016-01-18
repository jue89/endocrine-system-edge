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

}


module.exports = EndocrineSystem;

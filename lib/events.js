"use strict";

const events = require( 'events' );

const Definition = require( './definition.js' );
const Hormone = require( './hormone.js' );

class Events extends events.EventEmitter {

	_emitEvent( eventName, env, err ) {

		// We may want to attach an error event if it has been specified
		if( err instanceof Error ) {
			setImmediate( () => this.emit( eventName, err, env ) );
		} else {
			setImmediate( () => this.emit( eventName, env ) );
		}

	}

	_emitDefinitionEvent( eventName, name, definition, err ) {

		let deferredEnv;

		// If we got a definition instance we first will get some information,
		// otherwise we just return the definition name
		if( definition instanceof Definition ) {

			deferredEnv = definition.getOrigin().then( ( origin ) => {

				let data = definition.data;

				return {
					name: name,
					description: data.description,
					freshness: data.freshness,
					check: data.check,
					dataFormat: definition.dataFormat,
					origin: origin
				};

			} );

		} else {

			deferredEnv = Promise.resolve( {
				name: name
			} );

		}

		// After we gathered environment information, emit the event
		return deferredEnv.then( ( env ) => this._emitEvent( eventName, env, err ) );

	}

	_emitHormoneEvent( eventName, name, hormone, err ) {

		let deferredEnv;

		// If we got a hormone instance we first will get some information,
		// otherwise we just return the definition name
		if( hormone instanceof Hormone ) {

			let definition = hormone.definition;

			deferredEnv = definition.getOrigin().then( ( origin ) => {

				let data = hormone.data;

				return {
					name: name,
					sentAt: hormone.timestamp,
					data: data,
					isFresh: hormone.isFresh,
					freshness: hormone.freshness,
					isOK: hormone.isOK,
					error: hormone.error,
					origin: origin
				};

			} );

		} else {

			deferredEnv = Promise.resolve( {
				name: name
			} );

		}

		// After we gathered environment information, emit the event
		return deferredEnv.then( ( env ) => this._emitEvent( eventName, env, err ) );

	}

}

module.exports = Events;

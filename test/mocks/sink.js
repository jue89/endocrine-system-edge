"use strict";

let events = require( 'events' );

class SinkMock extends events.EventEmitter {

	constructor( es, name, definitionData ) {
		super();
	}

	shutdown() {

		this.emit( 'removedReceptor' );
		setImmediate( () => this.removeAllListeners() );

		return Promise.resolve();
	}

}

module.exports = SinkMock;

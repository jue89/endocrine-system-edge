"use strict";

let events = require( 'events' );

class SinkMock extends events.EventEmitter {

	constructor( es, name, definitionData ) {
		super();
	}

	destroy() {
		return Promise.resolve();
	}

}

module.exports = SinkMock;

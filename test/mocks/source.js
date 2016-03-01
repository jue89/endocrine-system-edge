"use strict";

let events = require( 'events' );

class SourceMock extends events.EventEmitter {

	constructor( es, name, definitionData ) {
		super();
	}

	shutdown() {
		return Promise.resolve();
	}

}

module.exports = SourceMock;

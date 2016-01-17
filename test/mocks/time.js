"use strict";

// Mock for time functions
class TimeMock {

	constructor( timestamp ) {
		this.timestamp = timestamp;
	}

	now() {
		return this.timestamp;
	}

	addSeconds( seconds ) {
		this.timestamp += seconds;
	}

	set( timestamp ) {
		this.timestamp = timestamp;
	}

}


module.exports = TimeMock;

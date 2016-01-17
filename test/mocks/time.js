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

}


module.exports = TimeMock;

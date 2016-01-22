"use strict";

// Mock for time functions
class TimeMock {

	constructor( timestamp ) {
		this.timestamp = timestamp;
		this.drift = 0;
	}

	now() {
		return this.timestamp;
	}

	getDrift() {
		return Promise.resolve( this.drift );
	}

	addSeconds( seconds ) {
		this.timestamp += seconds;
	}

	set( timestamp ) {
		this.timestamp = timestamp;
	}

	setDrift( drift ) {
		this.drift = drift;
	}

}


module.exports = TimeMock;

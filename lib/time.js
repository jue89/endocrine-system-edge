"use strict";

// This is a helper class for all time related things.
// The encapsulation allows the unit testing system to mock this class and fake
// the current time.

class Time {

	static now() {
		return Math.floor( Date.now() / 1000 );
	}

}

module.exports = Time;

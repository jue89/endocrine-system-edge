"use strict";

class ESMock {

	constructor( key, cert ) {
		this._key = key;
		this._cert = cert;
	}

	_publish( channel, payload ) {
		this._lastChannel = channel;
		this._lastPayload = payload;
		return Promise.resolve();
	}

}

module.exports = ESMock;

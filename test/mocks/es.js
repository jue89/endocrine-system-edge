"use strict";

class ESMock {

	constructor( key, cert, ca ) {
		this._key = key;
		this._cert = cert;
		this._ca = ca;
		this._onsub = {};
		this._definitionResendInterval = 60;
	}

	_publish( topic, payload ) {
		this._lastTopic = topic;
		this._lastPayload = payload;
		return Promise.resolve();
	}

	_subscribe( topic, handler ) {
		if( this._onsub[ topic ] && typeof this._onsub[ topic ] == 'function' ) {
			return this._onsub[ topic ]( handler );
		}
		return Promise.resolve();
	}

	_unsubscribe( topic ) {
		return Promise.resolve();
	}

}

module.exports = ESMock;

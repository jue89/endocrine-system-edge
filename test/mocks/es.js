"use strict";

class ESMock {

	constructor( key, cert, ca ) {
		this._key = key;
		this._cert = cert;
		this._ca = ca;
		this._onsub = {};
		this._definitionResendInterval = 60;
		this._handles = [];
	}

	_publish( topic, payload ) {
		this._lastTopic = topic;
		this._lastPayload = payload;
		return Promise.resolve();
	}

	_subscribe( topic, handler ) {
		let handle = this._handles.push( true ) - 1;
		if( this._onsub[ topic ] && typeof this._onsub[ topic ] == 'function' ) {
			return this._onsub[ topic ]( handler ).then( () => {
				return handle;
			} );
		} else {
			return Promise.resolve( handle );
		}
	}

	_unsubscribe( handle ) {
		if( this._handles[ handle ] !== undefined ) return Promise.resolve();
		else return Promise.reject( new Error( "Unknown subscription handle" ) );
	}

}

module.exports = ESMock;

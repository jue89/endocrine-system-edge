"use strict";

const EndocrineSystem = require( './lib/es.js' );
const Source = require( './lib/source.js' );
const Sink = require( './lib/sink.js' );
const Definition = require( './lib/definition.js' );
const Hormone = require( './lib/hormone.js' );

module.exports = function( options ) {
	return new EndocrineSystem( options );
};

module.exports.Classes = {
	EndocrineSystem,
	Source,
	Sink,
	Definition,
	Hormone
};

// Table of all events that might be emitted by ES instances.
// Format: each event has its own translation function, that outputs a (mostly)
// human-readable message (I'm not a Goethe, sry!) and an object representing
// the environment in that the event occured.
module.exports.eventTable = {
	'connecting': ( env ) => [ 'debug', `Connecting to ${env.url} ...`, env ],
	'error': ( err, env ) => [ 'err', err.message, env ],
	'online': ( env ) => [ 'notice', `Connected to ${env.url}`, env ],
	'offline': ( env ) => [ 'notice', `Disconnected from ${env.url}`, env ],
	'newReceptor': ( env ) => [ 'debug', `New receptor listening for ${env.filter}`, env ],
	'removedReceptor': ( env ) => [ 'debug', `Removed receptor listening for ${env.filter}`, env ],
	'receptionError': ( err, env ) => [ 'notice', err.message, env ],
	'defined': ( env ) => [ 'debug', `Received definition and subscribed for ${env.name} hormones`, env ],
	'refreshed': ( env ) => [ 'debug', `Refreshed definition for ${env.name} hormones`, env ],
	'undefined': ( env ) => [ 'debug', `Unsubscribed form ${env.name} hormones`, env ],
	'hormoneRefresh': ( env ) => [ 'debug', `Hormone ${env.name} has been refreshed`, env ],
	'hormoneExpiration': ( env ) => [ 'debug', `Hormone ${env.name} has expired`, env ],
	'hormoneRecovery': ( env ) => [ 'debug', `Hormone ${env.name} has been recovered`, env ],
	'hormoneError': ( env ) => [ 'debug', `Hormone ${env.name} reported an error: ${env.error}`, env ],
	'hormone': ( env ) => [ 'debug', `Received ${env.name} hormone`, env ],
	'newGland': ( env ) => [ 'debug', `Defined gland emitting ${env.name} hormones`, env ],
	'removedGland': ( env ) => [ 'debug', `Removed gland emitting ${env.name} hormones`, env ],
	'sentHormone': ( env ) => [ 'debug', `Sent ${env.name} hormone`, env ]
};

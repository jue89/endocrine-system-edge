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

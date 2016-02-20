"use strict";

const jsonGate = require( 'json-gate' );

// Schema checker for hormone definition
module.exports = jsonGate.createSchema( {
	type: 'object',
	properties: {
		cert: {
			type: 'string',
			required: true
		},
		description: {
			type: 'string'
		},
		check: {
			type: 'string'
		},
		freshness: {
			type: [ 'number', 'null' ],
			minimum: 1
		},
		dataFormat: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					name: {
						type: 'string',
						required: true
					},
					type: {
						type: 'string',
						enum: [ 'number', 'string', 'boolean' ],
						required: true
					},
					unit: {
						type: 'string'
					},
					description: {
						type: 'string'
					}
				},
				additionalProperties: false
			},
			default: []
		}
	},
	additionalProperties: false
} );

"use strict";

let assert = require( 'assert' );
let mockery = require( 'mockery' );


describe( "Class Sink", () => {

	let time, es;
	let Sink;

	before( () => {

		mockery.enable( {
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		} );

		// Install all mocks
		let TimeMock = require( './mocks/time.js' );
		let ESMock = require( './mocks/es.js' );
		mockery.registerMock( './es.js', ESMock );
		mockery.registerMock( './time.js', new TimeMock( 1452974164 ) );

		let pki = require( './mocks/pki.js' );
		time = require( './time.js' );
		es = new ESMock( pki.key, pki.cert, pki.ca );

		Sink = require( '../lib/sink.js' );

	} );

	after( () => {

		mockery.disable();

	} );

	it( "should complain about missing filter", ( done ) => {
		try {

			let s = new Sink( es );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about wrong pattern filter", ( done ) => {
		try {

			let s = new Sink( es, '/test' );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about silly cert check function", ( done ) => {
		try {

			let s = new Sink( es, 'test', true );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should throw an error if subscription to es fails", ( done ) => {

		// Set subscription handler
		es._onsub[ 'definition/test' ] = function() { return Promise.reject(); }

		let s = new Sink( es, 'test' );
		s.on( 'error', ( err ) => {
			done();
		} )

	} );

	it( "should reject a received definition due to cert validity in future", ( done ) => {

		// Set subscription handler
		es._onsub[ 'definition/test' ] = function( handler ) {
			setImmediate( () => { handler(
				'definition/test',
				'{"cert":"-----BEGIN CERTIFICATE-----\\nMIIC0TCCAjoCAQEwDQYJKoZIhvcNAQEFBQAwdzELMAkGA1UEBhMCREUxDDAKBgNV\\nBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGEludGVybmV0IFdp\\nZGdpdHMgUHR5IEx0ZDEkMCIGA1UEAwwbSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRk\\nIENBMB4XDTE1MDExODE3NDU1NFoXDTE4MDExNzE3NDU1NFowZzELMAkGA1UEBhMC\\nREUxDDAKBgNVBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGElu\\ndGVybmV0IFdpZGdpdHMgUHR5IEx0ZDEUMBIGA1UEAwwLVGVzdCBDbGllbnQwggEi\\nMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC99vbZtOQwJPLv4po5DUpT3ZSm\\nnFlejCttofbITXCFujNqJQRX9/glpG3upsyv2ghpo24uzBgAdiOUiWNZLs/BIzkq\\nhe8mJNpnIAIQrwA1Hu/cb/mi/533gPD1rV4QOeJRkDxEY/KaZkFQvoRyUpYY64Kl\\n/pJvRqfHCzWnFpZKjsO9jc6V4soNNXlqd0sx/qvk/o3NHpDPRuKwQq7fI7Ur1srw\\n1K2DIvlasJPFf/cYrmZEhijyPrTq/RHsYcKJzHDj/WvWhW3vtG/7d7nVuRn58f/H\\n7wA2bj64UyA7xnSAta5KGEIW2bgrcYG3ajjTVL3rZzj971bKfPJeUQC+tNl/AgMB\\nAAEwDQYJKoZIhvcNAQEFBQADgYEAmjOmAyYbyZN75E7a5kjR7SP5ZQ+NUPiREZNa\\n3aH28pIDvxncv4UZBqeSFjRuyQ7BBBiyVaMak3Q9eoFYDsF9fMsVyipqV27H4vzb\\nIoHF1xEDFxCydSOeJ7WC2uCCEpGF7HJkqXa3X/BRdOMDCxGymCtDA5MGTcDxVM0I\\nnLBk9W4=\\n-----END CERTIFICATE-----","description":"Test Definition","check":"err=Number;","freshness":1,"dataFormat":[{"name":"String","type":"string","description":"Funny stuff"},{"name":"Boolean","type":"boolean"},{"name":"Number","type":"number","unit":"V"}]}\nXsP0iKDG1bVIDarsJoQdSlRRZBpNHt/S3yPZi0o86TyfbIX7oYV3cgmTdjBIWqZuKrXQEw6aehhjlIQZgvAULIHPPOGHtdWED1BgTckibTD5VlAaOUCKx+ruip7/kuOymyyh1UzaZvt0BrXpkTTGf81XmmqtJ8BLx/KlMosy+Gh3WgDXk5kdIltE92Jt9P0KnUsBnD1wqTZyPgx9mhi0XNO6aiKC/JpdknvsA/bhTRmQMU6PXmvdHtAQrwt5zMSHKgclAfkiTeOHfHvVfbLgOn2LsJh9FSKFAlR6AFAu+Ezd10Fi1/9XjjE7c5pzM+Xq6gty+1xj/N9WZJtO7vFzxw=='
			) } );
			return Promise.resolve();
		};

		time.set( 1421603153 );

		let s = new Sink( es, 'test' );

		s.on( 'receiveError', ( e ) => {
			/*console.log(e);*/
			done();
		} )

	} );

	it( "should reject a received definition due to cert validity in past", ( done ) => {

		time.set( 1516211155 );

		let s = new Sink( es, 'test' );

		s.on( 'receiveError', ( e ) => {
			/*console.log(e);*/
			done();
		} )

	} );

	it( "should reject a received definition due to cert check function", ( done ) => {

		time.set( 1452974164 );

		let s = new Sink( es, 'test', ( name, cert ) => {

			try {
				assert.equal( name, 'test' );
				assert.equal( cert.commonName, 'Test Client' );
			} catch( e ) {
				done( e );
			}

			return Promise.reject();

		} );

		s.on( 'receiveError', ( err ) => {

			done();

		} );

	} );

	it( "should receive a definition, emit subscribe event and then remove the definition with the unsubscribe event emitted ", ( done ) => {

		let defHandler;

		// Set subscription handler
		es._onsub[ 'definition/test' ] = function( handler ) {
			setImmediate( () => { handler(
				'definition/test',
				'{"cert":"-----BEGIN CERTIFICATE-----\\nMIIC0TCCAjoCAQEwDQYJKoZIhvcNAQEFBQAwdzELMAkGA1UEBhMCREUxDDAKBgNV\\nBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGEludGVybmV0IFdp\\nZGdpdHMgUHR5IEx0ZDEkMCIGA1UEAwwbSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRk\\nIENBMB4XDTE1MDExODE3NDU1NFoXDTE4MDExNzE3NDU1NFowZzELMAkGA1UEBhMC\\nREUxDDAKBgNVBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGElu\\ndGVybmV0IFdpZGdpdHMgUHR5IEx0ZDEUMBIGA1UEAwwLVGVzdCBDbGllbnQwggEi\\nMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC99vbZtOQwJPLv4po5DUpT3ZSm\\nnFlejCttofbITXCFujNqJQRX9/glpG3upsyv2ghpo24uzBgAdiOUiWNZLs/BIzkq\\nhe8mJNpnIAIQrwA1Hu/cb/mi/533gPD1rV4QOeJRkDxEY/KaZkFQvoRyUpYY64Kl\\n/pJvRqfHCzWnFpZKjsO9jc6V4soNNXlqd0sx/qvk/o3NHpDPRuKwQq7fI7Ur1srw\\n1K2DIvlasJPFf/cYrmZEhijyPrTq/RHsYcKJzHDj/WvWhW3vtG/7d7nVuRn58f/H\\n7wA2bj64UyA7xnSAta5KGEIW2bgrcYG3ajjTVL3rZzj971bKfPJeUQC+tNl/AgMB\\nAAEwDQYJKoZIhvcNAQEFBQADgYEAmjOmAyYbyZN75E7a5kjR7SP5ZQ+NUPiREZNa\\n3aH28pIDvxncv4UZBqeSFjRuyQ7BBBiyVaMak3Q9eoFYDsF9fMsVyipqV27H4vzb\\nIoHF1xEDFxCydSOeJ7WC2uCCEpGF7HJkqXa3X/BRdOMDCxGymCtDA5MGTcDxVM0I\\nnLBk9W4=\\n-----END CERTIFICATE-----","description":"Test Definition","check":"err=Number;","freshness":1,"dataFormat":[{"name":"String","type":"string","description":"Funny stuff"},{"name":"Boolean","type":"boolean"},{"name":"Number","type":"number","unit":"V"}]}\nXsP0iKDG1bVIDarsJoQdSlRRZBpNHt/S3yPZi0o86TyfbIX7oYV3cgmTdjBIWqZuKrXQEw6aehhjlIQZgvAULIHPPOGHtdWED1BgTckibTD5VlAaOUCKx+ruip7/kuOymyyh1UzaZvt0BrXpkTTGf81XmmqtJ8BLx/KlMosy+Gh3WgDXk5kdIltE92Jt9P0KnUsBnD1wqTZyPgx9mhi0XNO6aiKC/JpdknvsA/bhTRmQMU6PXmvdHtAQrwt5zMSHKgclAfkiTeOHfHvVfbLgOn2LsJh9FSKFAlR6AFAu+Ezd10Fi1/9XjjE7c5pzM+Xq6gty+1xj/N9WZJtO7vFzxw=='
			); } );
			defHandler = handler;
			return Promise.resolve();
		};

		let s = new Sink( es, 'test' );

		s.on( 'subscribe', ( name, definition ) => {
			try {
				assert.equal( name, 'test' );
				assert.equal( definition.data.description, 'Test Definition' );
			} catch( e ) {
				done( e );
			}
			// Send empty message to remove definition
			defHandler( 'definition/test', '' );
		} );

		s.on( 'unsubscribe', ( name ) => {
			try {
				assert.equal( name, 'test' );
			} catch( e ) {
				done( e );
			}
			done();
		} );

	} );

	it( "should receive a hormone, emit the hormone event and expose the hormone", ( done ) => {

		// Set subscription handler
		es._onsub[ 'definition/test' ] = function( handler ) {
			setImmediate( () => { handler(
				'definition/test',
				'{"cert":"-----BEGIN CERTIFICATE-----\\nMIIC0TCCAjoCAQEwDQYJKoZIhvcNAQEFBQAwdzELMAkGA1UEBhMCREUxDDAKBgNV\\nBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGEludGVybmV0IFdp\\nZGdpdHMgUHR5IEx0ZDEkMCIGA1UEAwwbSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRk\\nIENBMB4XDTE1MDExODE3NDU1NFoXDTE4MDExNzE3NDU1NFowZzELMAkGA1UEBhMC\\nREUxDDAKBgNVBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGElu\\ndGVybmV0IFdpZGdpdHMgUHR5IEx0ZDEUMBIGA1UEAwwLVGVzdCBDbGllbnQwggEi\\nMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC99vbZtOQwJPLv4po5DUpT3ZSm\\nnFlejCttofbITXCFujNqJQRX9/glpG3upsyv2ghpo24uzBgAdiOUiWNZLs/BIzkq\\nhe8mJNpnIAIQrwA1Hu/cb/mi/533gPD1rV4QOeJRkDxEY/KaZkFQvoRyUpYY64Kl\\n/pJvRqfHCzWnFpZKjsO9jc6V4soNNXlqd0sx/qvk/o3NHpDPRuKwQq7fI7Ur1srw\\n1K2DIvlasJPFf/cYrmZEhijyPrTq/RHsYcKJzHDj/WvWhW3vtG/7d7nVuRn58f/H\\n7wA2bj64UyA7xnSAta5KGEIW2bgrcYG3ajjTVL3rZzj971bKfPJeUQC+tNl/AgMB\\nAAEwDQYJKoZIhvcNAQEFBQADgYEAmjOmAyYbyZN75E7a5kjR7SP5ZQ+NUPiREZNa\\n3aH28pIDvxncv4UZBqeSFjRuyQ7BBBiyVaMak3Q9eoFYDsF9fMsVyipqV27H4vzb\\nIoHF1xEDFxCydSOeJ7WC2uCCEpGF7HJkqXa3X/BRdOMDCxGymCtDA5MGTcDxVM0I\\nnLBk9W4=\\n-----END CERTIFICATE-----","description":"Test Definition","check":"err=Number;","freshness":1,"dataFormat":[{"name":"String","type":"string","description":"Funny stuff"},{"name":"Boolean","type":"boolean"},{"name":"Number","type":"number","unit":"V"}]}\nXsP0iKDG1bVIDarsJoQdSlRRZBpNHt/S3yPZi0o86TyfbIX7oYV3cgmTdjBIWqZuKrXQEw6aehhjlIQZgvAULIHPPOGHtdWED1BgTckibTD5VlAaOUCKx+ruip7/kuOymyyh1UzaZvt0BrXpkTTGf81XmmqtJ8BLx/KlMosy+Gh3WgDXk5kdIltE92Jt9P0KnUsBnD1wqTZyPgx9mhi0XNO6aiKC/JpdknvsA/bhTRmQMU6PXmvdHtAQrwt5zMSHKgclAfkiTeOHfHvVfbLgOn2LsJh9FSKFAlR6AFAu+Ezd10Fi1/9XjjE7c5pzM+Xq6gty+1xj/N9WZJtO7vFzxw=='
			); } );
			return Promise.resolve();
		};
		es._onsub[ 'hormone/test' ] = function( handler ) {
			setImmediate( () => { handler(
				'hormone/test',
				'1452029627\ntest\n1\n123\nRf/2W8SMf/xMyUKkukkST6ueXvaOlxILGBqIK4rv67R1GMrvbQPeCGDPl//iVYRqnbkgmmR86eLsNSwdnnJvxTMv2RP1j0nq4j7ezCzNc4tEch8XusY+KBOcXh4irp7BYQZzNcvMhNHKN9AmE1VrUvofDQfGl/AGshEGSJCMRN7yph9Uw6nyTCMrZghbG4hUR9Da1BD3pP6NALf8ybJNHc+VK8A2lO+cMG0lFZp3XBRknJ47dVSdvjC6JjH9acmAl8e8c2SAFyVVG0tFlNrOh5nX362Zeam5LF+I0irMCNlXzmYU1F07M2Eb/R4D5vjZSF/G+0jYJb6RKzIayY1wWQ=='
			); } );
			return Promise.resolve();
		};

		let s = new Sink( es, 'test' );

		s.on( 'receiveError', done );
		s.on( 'error', done );

		s.on( 'hormone', ( name, hormone ) => {
			try {
				assert.equal( name, 'test' );
				assert.deepEqual( hormone.data, {
					'String':  { 'value': "test" },
					'Number':  { 'value': 123, 'unit': "V" },
					'Boolean': { 'value': true }
				} );
				assert.equal( s.hormones.length, 1 );
				assert.equal( s.expiredHormones.length, 1 );
				assert.equal( s.errorHormones.length, 1 );
				assert.equal( s.goodHormones.length, 0 );
				assert.deepEqual( s.hormones[0], {
					name: 'test',
					sentAt: 1452029627,
					receivedAt: 1452974164,
					stateChangedAt: 1452974164,
					err: 123,
					isFresh: false,
					data: {
						'String':  { 'value': "test" },
						'Number':  { 'value': 123, 'unit': "V" },
						'Boolean': { 'value': true }
					}
				} )
			} catch( e ) {
				done( e );
			}
			done();
		} );

	} );

	it( "should receive a hormone and emit the hormoneError event", ( done ) => {

		let s = new Sink( es, 'test' );

		s.on( 'receiveError', done );
		s.on( 'error', done );

		s.on( 'hormoneError', ( name, hormone ) => {
			try {
				assert.equal( name, 'test' );
				assert.equal( hormone.error, 123 );
				assert.deepEqual( hormone.data, {
					'String':  { 'value': "test" },
					'Number':  { 'value': 123, 'unit': "V" },
					'Boolean': { 'value': true }
				} );
			} catch( e ) {
				done( e );
			}
			done();
		} );

	} );

	it( "should receive a fresh hormone and emit the hormoneExpired event later", ( done ) => {

		time.set( 1452029627 );

		let s = new Sink( es, 'test' );

		s.on( 'receiveError', done );
		s.on( 'error', done );

		s.on( 'hormone', ( name, hormone ) => {
			try {
				assert.equal( name, 'test' );
				assert.equal( s.hormones.length, 1 );
				assert.equal( s.expiredHormones.length, 0 );
				assert.equal( s.errorHormones.length, 1 );
				assert.equal( s.goodHormones.length, 0 );
			} catch( e ) {
				done( e );
			}
		} );

		s.on( 'hormoneExpired', ( name, hormone ) => {
			try {
				assert.equal( name, 'test' );
				assert.equal( s.hormones.length, 1 );
				assert.equal( s.expiredHormones.length, 1 );
				assert.equal( s.errorHormones.length, 1 );
				assert.equal( s.goodHormones.length, 0 );
			} catch( e ) {
				done( e );
			}
			done();
		} );

	} );

	it( "should receive a fresh hormone and emit the hormoneExpired event later", ( done ) => {

		time.set( 1452029627 );

		let s = new Sink( es, 'test' );

		s.on( 'receiveError', done );
		s.on( 'error', done );

		s.on( 'hormone', ( name, hormone ) => {
			try {
				assert.equal( name, 'test' );
				assert.equal( s.hormones.length, 1 );
				assert.equal( s.expiredHormones.length, 0 );
				assert.equal( s.errorHormones.length, 1 );
				assert.equal( s.goodHormones.length, 0 );
			} catch( e ) {
				done( e );
			}
		} );

		s.on( 'hormoneExpired', ( name, hormone ) => {
			try {
				assert.equal( name, 'test' );
				assert.equal( s.hormones.length, 1 );
				assert.equal( s.expiredHormones.length, 1 );
				assert.equal( s.errorHormones.length, 1 );
				assert.equal( s.goodHormones.length, 0 );
			} catch( e ) {
				done( e );
			}
			done();
		} );

	} );

	it( "should receive a fresh hormone, immediately undefine the source and not emit the hormoneExpired event", ( done ) => {

		let defHandler;

		// Set subscription handler
		es._onsub[ 'definition/test' ] = function( handler ) {
			setImmediate( () => { handler(
				'definition/test',
				'{"cert":"-----BEGIN CERTIFICATE-----\\nMIIC0TCCAjoCAQEwDQYJKoZIhvcNAQEFBQAwdzELMAkGA1UEBhMCREUxDDAKBgNV\\nBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGEludGVybmV0IFdp\\nZGdpdHMgUHR5IEx0ZDEkMCIGA1UEAwwbSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRk\\nIENBMB4XDTE1MDExODE3NDU1NFoXDTE4MDExNzE3NDU1NFowZzELMAkGA1UEBhMC\\nREUxDDAKBgNVBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGElu\\ndGVybmV0IFdpZGdpdHMgUHR5IEx0ZDEUMBIGA1UEAwwLVGVzdCBDbGllbnQwggEi\\nMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC99vbZtOQwJPLv4po5DUpT3ZSm\\nnFlejCttofbITXCFujNqJQRX9/glpG3upsyv2ghpo24uzBgAdiOUiWNZLs/BIzkq\\nhe8mJNpnIAIQrwA1Hu/cb/mi/533gPD1rV4QOeJRkDxEY/KaZkFQvoRyUpYY64Kl\\n/pJvRqfHCzWnFpZKjsO9jc6V4soNNXlqd0sx/qvk/o3NHpDPRuKwQq7fI7Ur1srw\\n1K2DIvlasJPFf/cYrmZEhijyPrTq/RHsYcKJzHDj/WvWhW3vtG/7d7nVuRn58f/H\\n7wA2bj64UyA7xnSAta5KGEIW2bgrcYG3ajjTVL3rZzj971bKfPJeUQC+tNl/AgMB\\nAAEwDQYJKoZIhvcNAQEFBQADgYEAmjOmAyYbyZN75E7a5kjR7SP5ZQ+NUPiREZNa\\n3aH28pIDvxncv4UZBqeSFjRuyQ7BBBiyVaMak3Q9eoFYDsF9fMsVyipqV27H4vzb\\nIoHF1xEDFxCydSOeJ7WC2uCCEpGF7HJkqXa3X/BRdOMDCxGymCtDA5MGTcDxVM0I\\nnLBk9W4=\\n-----END CERTIFICATE-----","description":"Test Definition","check":"err=Number;","freshness":1,"dataFormat":[{"name":"String","type":"string","description":"Funny stuff"},{"name":"Boolean","type":"boolean"},{"name":"Number","type":"number","unit":"V"}]}\nXsP0iKDG1bVIDarsJoQdSlRRZBpNHt/S3yPZi0o86TyfbIX7oYV3cgmTdjBIWqZuKrXQEw6aehhjlIQZgvAULIHPPOGHtdWED1BgTckibTD5VlAaOUCKx+ruip7/kuOymyyh1UzaZvt0BrXpkTTGf81XmmqtJ8BLx/KlMosy+Gh3WgDXk5kdIltE92Jt9P0KnUsBnD1wqTZyPgx9mhi0XNO6aiKC/JpdknvsA/bhTRmQMU6PXmvdHtAQrwt5zMSHKgclAfkiTeOHfHvVfbLgOn2LsJh9FSKFAlR6AFAu+Ezd10Fi1/9XjjE7c5pzM+Xq6gty+1xj/N9WZJtO7vFzxw=='
			); } );
			defHandler = handler;
			return Promise.resolve();
		};

		time.set( 1452029627 );

		let s = new Sink( es, 'test' );

		s.on( 'receiveError', done );
		s.on( 'error', done );

		s.on( 'hormone', ( name, hormone ) => {
			defHandler( 'definition/test', '' );
			setTimeout( done, 1200 );
		} );

		s.on( 'hormoneExpired', ( name, hormone ) => {
			done( new Error( "This must not happen!" ) );
		} );

	} );

} );

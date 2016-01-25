"use strict";

let assert = require( 'assert' );
let mockery = require( 'mockery' );


describe( "Class HormoneSink", () => {

	let time, pki, definition;
	let HormoneSink;

	before( () => {

		mockery.enable( {
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		} );

		// Install all mocks
		let TimeMock = require( './mocks/time.js' );
		mockery.registerMock( './time.js', new TimeMock( 1452974164 ) );

		// require all librarys required for tests
		pki = require( './mocks/pki.js' );
		time = require( './time.js' );
		HormoneSink = require( '../lib/hormone-sink.js' );
		let DefinitionSink = require( '../lib/definition-sink.js' );
		definition = new DefinitionSink( '{"cert":"-----BEGIN CERTIFICATE-----\\nMIIC0TCCAjoCAQEwDQYJKoZIhvcNAQEFBQAwdzELMAkGA1UEBhMCREUxDDAKBgNV\\nBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGEludGVybmV0IFdp\\nZGdpdHMgUHR5IEx0ZDEkMCIGA1UEAwwbSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRk\\nIENBMB4XDTE1MDExODE3NDU1NFoXDTE4MDExNzE3NDU1NFowZzELMAkGA1UEBhMC\\nREUxDDAKBgNVBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGElu\\ndGVybmV0IFdpZGdpdHMgUHR5IEx0ZDEUMBIGA1UEAwwLVGVzdCBDbGllbnQwggEi\\nMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC99vbZtOQwJPLv4po5DUpT3ZSm\\nnFlejCttofbITXCFujNqJQRX9/glpG3upsyv2ghpo24uzBgAdiOUiWNZLs/BIzkq\\nhe8mJNpnIAIQrwA1Hu/cb/mi/533gPD1rV4QOeJRkDxEY/KaZkFQvoRyUpYY64Kl\\n/pJvRqfHCzWnFpZKjsO9jc6V4soNNXlqd0sx/qvk/o3NHpDPRuKwQq7fI7Ur1srw\\n1K2DIvlasJPFf/cYrmZEhijyPrTq/RHsYcKJzHDj/WvWhW3vtG/7d7nVuRn58f/H\\n7wA2bj64UyA7xnSAta5KGEIW2bgrcYG3ajjTVL3rZzj971bKfPJeUQC+tNl/AgMB\\nAAEwDQYJKoZIhvcNAQEFBQADgYEAmjOmAyYbyZN75E7a5kjR7SP5ZQ+NUPiREZNa\\n3aH28pIDvxncv4UZBqeSFjRuyQ7BBBiyVaMak3Q9eoFYDsF9fMsVyipqV27H4vzb\\nIoHF1xEDFxCydSOeJ7WC2uCCEpGF7HJkqXa3X/BRdOMDCxGymCtDA5MGTcDxVM0I\\nnLBk9W4=\\n-----END CERTIFICATE-----","description":"Test Definition","check":"err=Number;","freshness":1,"dataFormat":[{"name":"String","type":"string","description":"Funny stuff"},{"name":"Boolean","type":"boolean"},{"name":"Number","type":"number","unit":"V"}]}\nXsP0iKDG1bVIDarsJoQdSlRRZBpNHt/S3yPZi0o86TyfbIX7oYV3cgmTdjBIWqZuKrXQEw6aehhjlIQZgvAULIHPPOGHtdWED1BgTckibTD5VlAaOUCKx+ruip7/kuOymyyh1UzaZvt0BrXpkTTGf81XmmqtJ8BLx/KlMosy+Gh3WgDXk5kdIltE92Jt9P0KnUsBnD1wqTZyPgx9mhi0XNO6aiKC/JpdknvsA/bhTRmQMU6PXmvdHtAQrwt5zMSHKgclAfkiTeOHfHvVfbLgOn2LsJh9FSKFAlR6AFAu+Ezd10Fi1/9XjjE7c5pzM+Xq6gty+1xj/N9WZJtO7vFzxw==' );

	} );

	after( () => {

		mockery.disable();

	} );

	it( "should complain about missing defintion", ( done ) => {
		try {

			let h = new HormoneSink();

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about missing payload", ( done ) => {
		try {

			let h = new HormoneSink( definition );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about wrong signature", ( done ) => {
		try {

			let h = new HormoneSink( definition, '1452029627\ntest\n1\n123\nRf/2W8SMf/xMyUKkukkST6ueXvaOlxILGBqIK4rv67R1GMrvbQPeCGDPl//iVYRqnbkgmmR86eLsNSwdnnJvxTMv2RP1j0nq4j7ezCzNc4tEch8XusY+KBOcXh4irp7BYQZzNcvMhNHKN9AmE1VrUvofDQfGl/AGshEGSJCMRN7yph9Uw6nyTCMrZghbG4hUR9Da1BD3pP6NALf8ybJNHc+VK8A2lO+cMG0lFYp3XBRknJ47dVSdvjC6JjH9acmAl8e8c2SAFyVVG0tFlNrOh5nX362Zeam5LF+I0irMCNlXzmYU1F07M2Eb/R4D5vjZSF/G+0jYJb6RKzIayY1wWQ==' );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should successfully read hormone payload", ( done ) => {

		let payload = '1452029627\ntest\n1\n123\nRf/2W8SMf/xMyUKkukkST6ueXvaOlxILGBqIK4rv67R1GMrvbQPeCGDPl//iVYRqnbkgmmR86eLsNSwdnnJvxTMv2RP1j0nq4j7ezCzNc4tEch8XusY+KBOcXh4irp7BYQZzNcvMhNHKN9AmE1VrUvofDQfGl/AGshEGSJCMRN7yph9Uw6nyTCMrZghbG4hUR9Da1BD3pP6NALf8ybJNHc+VK8A2lO+cMG0lFZp3XBRknJ47dVSdvjC6JjH9acmAl8e8c2SAFyVVG0tFlNrOh5nX362Zeam5LF+I0irMCNlXzmYU1F07M2Eb/R4D5vjZSF/G+0jYJb6RKzIayY1wWQ==';

		let h = new HormoneSink( definition, payload );

		assert.deepEqual( h.data, {
			'String':  "test",
			'Number':  123,
			'Boolean': true
		} );

		assert.equal( h.payload, payload );

		assert.equal( h.error, 123 );

		assert.equal( h.timestamp, 1452029627 );

		assert.deepEqual( h.definition.data, definition.data );

		done();

	} );

	it( "should create and read fresh hormone", ( done ) => {

		let h = new HormoneSink( definition, '1452974164\ntest\n1\n123\nQ5EtMyapGsIMrNuZ6+7a2ztIPS1BEEiR0Vq+pu7/wRGzBiVo2SKttfhiDzHXs+5FVQY2lclQJdHgxIZbCG6xKbSDs9Vg5DnOkAW7yNN5shYUKJoropZ0xPYQ6iU3VyTKOb5R15/xS5rxtxMjpPVat5rjXF/5a0ZPxyrq4dyX75bEht7vOWG2cJw6iQ4NgQXKoPm4pU5PP3P93Wqa3qYs9PNxX7uS2w+ogHPqOdH2dL4Wvu1xT9xFAdhSfVKm/lxd6OEqZEFXJ6EBy5HZ+80tZzp/iLjnk/4g8ar7QFKWp8jNBM0xTeF1xmLPxd3n9tBAUtE0HPi5xjvK9v8qG8svSw==' );

		assert.equal( h.isFresh, true );

		done();

	} );

	it( "should create and read expired hormone", ( done ) => {

		let h = new HormoneSink( definition, '1452974164\ntest\n1\n123\nQ5EtMyapGsIMrNuZ6+7a2ztIPS1BEEiR0Vq+pu7/wRGzBiVo2SKttfhiDzHXs+5FVQY2lclQJdHgxIZbCG6xKbSDs9Vg5DnOkAW7yNN5shYUKJoropZ0xPYQ6iU3VyTKOb5R15/xS5rxtxMjpPVat5rjXF/5a0ZPxyrq4dyX75bEht7vOWG2cJw6iQ4NgQXKoPm4pU5PP3P93Wqa3qYs9PNxX7uS2w+ogHPqOdH2dL4Wvu1xT9xFAdhSfVKm/lxd6OEqZEFXJ6EBy5HZ+80tZzp/iLjnk/4g8ar7QFKWp8jNBM0xTeF1xmLPxd3n9tBAUtE0HPi5xjvK9v8qG8svSw==' );

		time.addSeconds( 3 );

		assert.equal( h.isFresh, false );

		done();

	} );

} );

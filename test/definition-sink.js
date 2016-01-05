"use strict";

let assert = require( 'assert' );

let DefinitionSink = require( '../lib/definition-sink.js' );
let pki = require( './pki.js' );


describe( "Class DefinitionSink", () => {

	it( "should complain about empty data", ( done ) => {
		try {

			let d = new DefinitionSink();

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about unparsable data", ( done ) => {
		try {

			let d = new DefinitionSink( "bla\nblub" );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about wrong signature", ( done ) => {
		try {

			let d = new DefinitionSink( '{"cert":"-----BEGIN CERTIFICATE-----\\nMIIC0TCCAjoCAQEwDQYJKoZIhvcNAQEFBQAwdzELMAkGA1UEBhMCREUxDDAKBgNV\\nBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGEludGVybmV0IFdp\\nZGdpdHMgUHR5IEx0ZDEkMCIGA1UEAwwbSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRk\\nIENBMB4XDTE1MDExODE3NDU1NFoXDTE4MDExNzE3NDU1NFowZzELMAkGA1UEBhMC\\nREUxDDAKBgNVBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGElu\\ndGVybmV0IFdpZGdpdHMgUHR5IEx0ZDEUMBIGA1UEAwwLVGVzdCBDbGllbnQwggEi\\nMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC99vbZtOQwJPLv4po5DUpT3ZSm\\nnFlejCttofbITXCFujNqJQRX9/glpG3upsyv2ghpo24uzBgAdiOUiWNZLs/BIzkq\\nhe8mJNpnIAIQrwA1Hu/cb/mi/533gPD1rV4QOeJRkDxEY/KaZkFQvoRyUpYY64Kl\\n/pJvRqfHCzWnFpZKjsO9jc6V4soNNXlqd0sx/qvk/o3NHpDPRuKwQq7fI7Ur1srw\\n1K2DIvlasJPFf/cYrmZEhijyPrTq/RHsYcKJzHDj/WvWhW3vtG/7d7nVuRn58f/H\\n7wA2bj64UyA7xnSAta5KGEIW2bgrcYG3ajjTVL3rZzj971bKfPJeUQC+tNl/AgMB\\nAAEwDQYJKoZIhvcNAQEFBQADgYEAmjOmAyYbyZN75E7a5kjR7SP5ZQ+NUPiREZNa\\n3aH28pIDvxncv4UZBqeSFjRuyQ7BBBiyVaMak3Q9eoFYDsF9fMsVyipqV27H4vzb\\nIoHF1xEDFxCydSOeJ7WC2uCCEpGF7HJkqXa3X/BRdOMDCxGymCtDA5MGTcDxVM0I\\nnLBk9W4=\\n-----END CERTIFICATE-----","dataFormat":[]}\n Uacoxv+4vJAjmuZSvwvQU1j2rOr/7J7NzIXoO64yXixYyS2z5/ob+O83bsCVJ9TXX3uSHPeuoQithNDswgg9Bn4cFKuAXJxpCAZcKucncLUkzC0OAiDuZGS6WSdZ61FfAyZ4NLiP1DbV9L951BPKTo65HdunwQzy8o156fy90Qyo8FDdDAUKk6SJKYWFA4RpB4SqoLri8smOKTsE7Sj5KcOqSrGI0nJA3QglAKNn43PRAGxfs84d9rHH6ViF7ucIQTyUmOM71j3aEgr+HRiLjfAxMV3aES7aLCH/wtmu0CTZaVHL6HuD0qD/Bgg+K7KBYvEvIZ1FFdWorWp7nwjUFA==' );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about non-pem certificate", ( done ) => {
		try {

			let d = new DefinitionSink( '{"cert":"bla","dataFormat":[]}\n XCpopdi62I8eNWKJ0Tc+Wch8m2TPBuC3F6fuhUk8zgnYetsjU7zqoelzvoqWK6vjG8wtbsjHLt99MP3sNCIxT7y9kddQq7cDxtb5eVZ9DN8Hg9T4wnISep4ZouyZO02x3xpTbM583lsd3vQcZSbjt1MiZscuxbRwsu3GtE3OVsNarQCvq+JHUA/pGSHEDzIVOJMV4F/uyvKNPB4KAIfI2QMu9rHbqFI6wdlJRGR0zlhlMqN0jlHvSUoL39lrvNzkKwKhR4+sSfVJgvqEtCEqJuBqB8PZpt8ZYuwQiHD80K9dMpjSw5tG7buM0PEN62DUfB7Vg7RPXXyHVk54+JejJg==' );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should accept minimal defintion format", ( done ) => {

		let d = new DefinitionSink( '{"cert":"-----BEGIN CERTIFICATE-----\\nMIIC0TCCAjoCAQEwDQYJKoZIhvcNAQEFBQAwdzELMAkGA1UEBhMCREUxDDAKBgNV\\nBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGEludGVybmV0IFdp\\nZGdpdHMgUHR5IEx0ZDEkMCIGA1UEAwwbSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRk\\nIENBMB4XDTE1MDExODE3NDU1NFoXDTE4MDExNzE3NDU1NFowZzELMAkGA1UEBhMC\\nREUxDDAKBgNVBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGElu\\ndGVybmV0IFdpZGdpdHMgUHR5IEx0ZDEUMBIGA1UEAwwLVGVzdCBDbGllbnQwggEi\\nMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC99vbZtOQwJPLv4po5DUpT3ZSm\\nnFlejCttofbITXCFujNqJQRX9/glpG3upsyv2ghpo24uzBgAdiOUiWNZLs/BIzkq\\nhe8mJNpnIAIQrwA1Hu/cb/mi/533gPD1rV4QOeJRkDxEY/KaZkFQvoRyUpYY64Kl\\n/pJvRqfHCzWnFpZKjsO9jc6V4soNNXlqd0sx/qvk/o3NHpDPRuKwQq7fI7Ur1srw\\n1K2DIvlasJPFf/cYrmZEhijyPrTq/RHsYcKJzHDj/WvWhW3vtG/7d7nVuRn58f/H\\n7wA2bj64UyA7xnSAta5KGEIW2bgrcYG3ajjTVL3rZzj971bKfPJeUQC+tNl/AgMB\\nAAEwDQYJKoZIhvcNAQEFBQADgYEAmjOmAyYbyZN75E7a5kjR7SP5ZQ+NUPiREZNa\\n3aH28pIDvxncv4UZBqeSFjRuyQ7BBBiyVaMak3Q9eoFYDsF9fMsVyipqV27H4vzb\\nIoHF1xEDFxCydSOeJ7WC2uCCEpGF7HJkqXa3X/BRdOMDCxGymCtDA5MGTcDxVM0I\\nnLBk9W4=\\n-----END CERTIFICATE-----","dataFormat":[]}\n Uacoxv+4vJAjmuZSvwvQU1j2rOr/7J7NzIXoO64yXixYyS2z5/ob+O83bsCVJ9TXX3uSHPeuoQithNDswgg9Bn4cFKuAXJxpCAZcKucncLUkzC0OAiDuZGS6WSdZ61FfAyZ4NLiP1DbV9L951BPKTo65HdunwQzy8o156fy90Qyo8FDdDAUKk6SJKXWFA4RpB4SqoLri8smOKTsE7Sj5KcOqSrGI0nJA3QglAKNn43PRAGxfs84d9rHH6ViF7ucIQTyUmOM71j3aEgr+HRiLjfAxMV3aES7aLCH/wtmu0CTZaVHL6HuD0qD/Bgg+K7KBYvEvIZ1FFdWorWp7nwjUFA==' );

		assert.deepEqual( d.data, {
			cert: pki.cert,
			dataFormat: []
		} );

		done();
	} );

	it( "should accept minimal full format", ( done ) => {

		let d = new DefinitionSink( '{"cert":"-----BEGIN CERTIFICATE-----\\nMIIC0TCCAjoCAQEwDQYJKoZIhvcNAQEFBQAwdzELMAkGA1UEBhMCREUxDDAKBgNV\\nBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGEludGVybmV0IFdp\\nZGdpdHMgUHR5IEx0ZDEkMCIGA1UEAwwbSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRk\\nIENBMB4XDTE1MDExODE3NDU1NFoXDTE4MDExNzE3NDU1NFowZzELMAkGA1UEBhMC\\nREUxDDAKBgNVBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGElu\\ndGVybmV0IFdpZGdpdHMgUHR5IEx0ZDEUMBIGA1UEAwwLVGVzdCBDbGllbnQwggEi\\nMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC99vbZtOQwJPLv4po5DUpT3ZSm\\nnFlejCttofbITXCFujNqJQRX9/glpG3upsyv2ghpo24uzBgAdiOUiWNZLs/BIzkq\\nhe8mJNpnIAIQrwA1Hu/cb/mi/533gPD1rV4QOeJRkDxEY/KaZkFQvoRyUpYY64Kl\\n/pJvRqfHCzWnFpZKjsO9jc6V4soNNXlqd0sx/qvk/o3NHpDPRuKwQq7fI7Ur1srw\\n1K2DIvlasJPFf/cYrmZEhijyPrTq/RHsYcKJzHDj/WvWhW3vtG/7d7nVuRn58f/H\\n7wA2bj64UyA7xnSAta5KGEIW2bgrcYG3ajjTVL3rZzj971bKfPJeUQC+tNl/AgMB\\nAAEwDQYJKoZIhvcNAQEFBQADgYEAmjOmAyYbyZN75E7a5kjR7SP5ZQ+NUPiREZNa\\n3aH28pIDvxncv4UZBqeSFjRuyQ7BBBiyVaMak3Q9eoFYDsF9fMsVyipqV27H4vzb\\nIoHF1xEDFxCydSOeJ7WC2uCCEpGF7HJkqXa3X/BRdOMDCxGymCtDA5MGTcDxVM0I\\nnLBk9W4=\\n-----END CERTIFICATE-----","description":"Test Definition","check":"err=0;","freshness":60,"dataFormat":[{"name":"String","type":"string","description":"Funny stuff"},{"name":"Boolean","type":"boolean"},{"name":"Number","type":"number","unit":"V"}]}\n LGt2OmAwKenIt1b0nrGzOrEx2iHYNKIz89SqGEXFYwyNoUQzwiQCQUsbxnOvscdauqs1lvHLgNMP90m06+mgRq5Tx2yk2ajV6qq6LscNtkZJfxapF3bq+VAiRTBqccIut7hAEUduwC6un42yPggDnqrbJQqYqYE7WWtm6Kmc1lJYBP+QKoFSruc8wL8Bkxe+xc9mT1bX9hzrgXLpzGrFP7AVdtvGAW/gQoTVC9Bgb7jVR3uWz7n1/5N+kai+MzxOxhYC9UDfRKNa7jPnI5doXA2O7CBLnGujrTd39g5/C0AI/GxLk6OvSVT0/hTy0P30WJSeHIDqt9Ny6bpAn7JXxg==' );

		assert.deepEqual( d.data, {
			cert: pki.cert,
			description: "Test Definition",
			check: "err=0;",
			freshness: 60,
			dataFormat: [ {
				name: "String",
				type: 'string',
				description: "Funny stuff"
			}, {
				name: "Boolean",
				type: 'boolean'
			}, {
				name: "Number",
				type: 'number',
				unit: "V"
			} ]
		} );

		done();
	} );

} );

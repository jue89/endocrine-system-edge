"use strict";

let pki = require( './pki.js' );

module.exports = {
	min: {
		definition: {
			payload: '{"cert":"-----BEGIN CERTIFICATE-----\\nMIIC0TCCAjoCAQEwDQYJKoZIhvcNAQEFBQAwdzELMAkGA1UEBhMCREUxDDAKBgNV\\nBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGEludGVybmV0IFdp\\nZGdpdHMgUHR5IEx0ZDEkMCIGA1UEAwwbSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRk\\nIENBMB4XDTE1MDExODE3NDU1NFoXDTE4MDExNzE3NDU1NFowZzELMAkGA1UEBhMC\\nREUxDDAKBgNVBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGElu\\ndGVybmV0IFdpZGdpdHMgUHR5IEx0ZDEUMBIGA1UEAwwLVGVzdCBDbGllbnQwggEi\\nMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC99vbZtOQwJPLv4po5DUpT3ZSm\\nnFlejCttofbITXCFujNqJQRX9/glpG3upsyv2ghpo24uzBgAdiOUiWNZLs/BIzkq\\nhe8mJNpnIAIQrwA1Hu/cb/mi/533gPD1rV4QOeJRkDxEY/KaZkFQvoRyUpYY64Kl\\n/pJvRqfHCzWnFpZKjsO9jc6V4soNNXlqd0sx/qvk/o3NHpDPRuKwQq7fI7Ur1srw\\n1K2DIvlasJPFf/cYrmZEhijyPrTq/RHsYcKJzHDj/WvWhW3vtG/7d7nVuRn58f/H\\n7wA2bj64UyA7xnSAta5KGEIW2bgrcYG3ajjTVL3rZzj971bKfPJeUQC+tNl/AgMB\\nAAEwDQYJKoZIhvcNAQEFBQADgYEAmjOmAyYbyZN75E7a5kjR7SP5ZQ+NUPiREZNa\\n3aH28pIDvxncv4UZBqeSFjRuyQ7BBBiyVaMak3Q9eoFYDsF9fMsVyipqV27H4vzb\\nIoHF1xEDFxCydSOeJ7WC2uCCEpGF7HJkqXa3X/BRdOMDCxGymCtDA5MGTcDxVM0I\\nnLBk9W4=\\n-----END CERTIFICATE-----","dataFormat":[]}\nUacoxv+4vJAjmuZSvwvQU1j2rOr/7J7NzIXoO64yXixYyS2z5/ob+O83bsCVJ9TXX3uSHPeuoQithNDswgg9Bn4cFKuAXJxpCAZcKucncLUkzC0OAiDuZGS6WSdZ61FfAyZ4NLiP1DbV9L951BPKTo65HdunwQzy8o156fy90Qyo8FDdDAUKk6SJKXWFA4RpB4SqoLri8smOKTsE7Sj5KcOqSrGI0nJA3QglAKNn43PRAGxfs84d9rHH6ViF7ucIQTyUmOM71j3aEgr+HRiLjfAxMV3aES7aLCH/wtmu0CTZaVHL6HuD0qD/Bgg+K7KBYvEvIZ1FFdWorWp7nwjUFA==',
			payloadWrongSignature: '{"cert":"-----BEGIN CERTIFICATE-----\\nMIIC0TCCAjoCAQEwDQYJKoZIhvcNAQEFBQAwdzELMAkGA1UEBhMCREUxDDAKBgNV\\nBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGEludGVybmV0IFdp\\nZGdpdHMgUHR5IEx0ZDEkMCIGA1UEAwwbSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRk\\nIENBMB4XDTE1MDExODE3NDU1NFoXDTE4MDExNzE3NDU1NFowZzELMAkGA1UEBhMC\\nREUxDDAKBgNVBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGElu\\ndGVybmV0IFdpZGdpdHMgUHR5IEx0ZDEUMBIGA1UEAwwLVGVzdCBDbGllbnQwggEi\\nMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC99vbZtOQwJPLv4po5DUpT3ZSm\\nnFlejCttofbITXCFujNqJQRX9/glpG3upsyv2ghpo24uzBgAdiOUiWNZLs/BIzkq\\nhe8mJNpnIAIQrwA1Hu/cb/mi/533gPD1rV4QOeJRkDxEY/KaZkFQvoRyUpYY64Kl\\n/pJvRqfHCzWnFpZKjsO9jc6V4soNNXlqd0sx/qvk/o3NHpDPRuKwQq7fI7Ur1srw\\n1K2DIvlasJPFf/cYrmZEhijyPrTq/RHsYcKJzHDj/WvWhW3vtG/7d7nVuRn58f/H\\n7wA2bj64UyA7xnSAta5KGEIW2bgrcYG3ajjTVL3rZzj971bKfPJeUQC+tNl/AgMB\\nAAEwDQYJKoZIhvcNAQEFBQADgYEAmjOmAyYbyZN75E7a5kjR7SP5ZQ+NUPiREZNa\\n3aH28pIDvxncv4UZBqeSFjRuyQ7BBBiyVaMak3Q9eoFYDsF9fMsVyipqV27H4vzb\\nIoHF1xEDFxCydSOeJ7WC2uCCEpGF7HJkqXa3X/BRdOMDCxGymCtDA5MGTcDxVM0I\\nnLBk9W4=\\n-----END CERTIFICATE-----","dataFormat":[]}\n Uacoxv+4vJAjmuZSvwvQU1j2rOr/7J7NzIXoO64yXixYyS2z5/ob+O83bsCVJ9TXX3uSHPeuoQithNDswgg9Bn4cFKuAXJxpCAZcKucncLUkzC0OAiDuZGS6WSdZ61FfAyZ4NLiP1DbV9L951BPKTo65HdunwQzy8o156fy90Qyo8FDdDAUKk6SJKYWFA4RpB4SqoLri8smOKTsE7Sj5KcOqSrGI0nJA3QglAKNn43PRAGxfs84d9rHH6ViF7ucIQTyUmOM71j3aEgr+HRiLjfAxMV3aES7aLCH/wtmu0CTZaVHL6HuD0qD/Bgg+K7KBYvEvIZ1FFdWorWp7nwjUFA==',
			payloadWrongCert: '{"cert":"bla","dataFormat":[]}\n XCpopdi62I8eNWKJ0Tc+Wch8m2TPBuC3F6fuhUk8zgnYetsjU7zqoelzvoqWK6vjG8wtbsjHLt99MP3sNCIxT7y9kddQq7cDxtb5eVZ9DN8Hg9T4wnISep4ZouyZO02x3xpTbM583lsd3vQcZSbjt1MiZscuxbRwsu3GtE3OVsNarQCvq+JHUA/pGSHEDzIVOJMV4F/uyvKNPB4KAIfI2QMu9rHbqFI6wdlJRGR0zlhlMqN0jlHvSUoL39lrvNzkKwKhR4+sSfVJgvqEtCEqJuBqB8PZpt8ZYuwQiHD80K9dMpjSw5tG7buM0PEN62DUfB7Vg7RPXXyHVk54+JejJg==',
			data: {
				cert: pki.cert,
				dataFormat: []
			},
			dataUnkownOption: {
				cert: pki.cert,
				dataFormat: [],
				unkownOption: true
			},
			dataFormat: {}
		}
	},
	max: {
		definition: {
			payload: '{"cert":"-----BEGIN CERTIFICATE-----\\nMIIC0TCCAjoCAQEwDQYJKoZIhvcNAQEFBQAwdzELMAkGA1UEBhMCREUxDDAKBgNV\\nBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGEludGVybmV0IFdp\\nZGdpdHMgUHR5IEx0ZDEkMCIGA1UEAwwbSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRk\\nIENBMB4XDTE1MDExODE3NDU1NFoXDTE4MDExNzE3NDU1NFowZzELMAkGA1UEBhMC\\nREUxDDAKBgNVBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGElu\\ndGVybmV0IFdpZGdpdHMgUHR5IEx0ZDEUMBIGA1UEAwwLVGVzdCBDbGllbnQwggEi\\nMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC99vbZtOQwJPLv4po5DUpT3ZSm\\nnFlejCttofbITXCFujNqJQRX9/glpG3upsyv2ghpo24uzBgAdiOUiWNZLs/BIzkq\\nhe8mJNpnIAIQrwA1Hu/cb/mi/533gPD1rV4QOeJRkDxEY/KaZkFQvoRyUpYY64Kl\\n/pJvRqfHCzWnFpZKjsO9jc6V4soNNXlqd0sx/qvk/o3NHpDPRuKwQq7fI7Ur1srw\\n1K2DIvlasJPFf/cYrmZEhijyPrTq/RHsYcKJzHDj/WvWhW3vtG/7d7nVuRn58f/H\\n7wA2bj64UyA7xnSAta5KGEIW2bgrcYG3ajjTVL3rZzj971bKfPJeUQC+tNl/AgMB\\nAAEwDQYJKoZIhvcNAQEFBQADgYEAmjOmAyYbyZN75E7a5kjR7SP5ZQ+NUPiREZNa\\n3aH28pIDvxncv4UZBqeSFjRuyQ7BBBiyVaMak3Q9eoFYDsF9fMsVyipqV27H4vzb\\nIoHF1xEDFxCydSOeJ7WC2uCCEpGF7HJkqXa3X/BRdOMDCxGymCtDA5MGTcDxVM0I\\nnLBk9W4=\\n-----END CERTIFICATE-----","description":"Test Definition","check":"err=Number;","freshness":1,"dataFormat":[{"name":"String","type":"string","description":"Funny stuff"},{"name":"Boolean","type":"boolean"},{"name":"Number","type":"number","unit":"V"}]}\nXsP0iKDG1bVIDarsJoQdSlRRZBpNHt/S3yPZi0o86TyfbIX7oYV3cgmTdjBIWqZuKrXQEw6aehhjlIQZgvAULIHPPOGHtdWED1BgTckibTD5VlAaOUCKx+ruip7/kuOymyyh1UzaZvt0BrXpkTTGf81XmmqtJ8BLx/KlMosy+Gh3WgDXk5kdIltE92Jt9P0KnUsBnD1wqTZyPgx9mhi0XNO6aiKC/JpdknvsA/bhTRmQMU6PXmvdHtAQrwt5zMSHKgclAfkiTeOHfHvVfbLgOn2LsJh9FSKFAlR6AFAu+Ezd10Fi1/9XjjE7c5pzM+Xq6gty+1xj/N9WZJtO7vFzxw==',
			data: {
				cert: pki.cert,
				description: "Test Definition",
				check: "err=Number;",
				freshness: 1,
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
			},
			dataFormat: {
				'String': {
					type: 'string',
					unit: null,
					description: "Funny stuff"
				},
				'Boolean': {
					type: 'boolean',
					unit: null,
					description: null
				},
				'Number': {
					type: 'number',
					unit: "V",
					description: null
				}
			}
		},
		hormone: [ {
			timestamp: 1452974164020,
			payload: '1452974164020\ntest\n1\n0\np49kAHUKHoSUysIf0yxiMDqBfwhs5EWGUVwNid85KcsudPquPPwAZG+3y56X5nP8cwN9yzlCgesl7y+cFBQ7vTBIuqVoOBVAx9Q37IQ8zGodBWkqDg0S193eclYDgubLjMHU54/xYFXLF8ivvqsD0npgUZcXndeBUnR2JVrnQ9kMh6PgbUvyaC85AjaUdWyG6zCOgCLRWO7bP9J0BKGwombF28TumTRtXlEU4Qjgn5GCeJlpzI4s0Qb4oiHUOoZWacunptGVZhyNvcZ5D0MrW0PbH3COLiXnPu1Ygw48hxAZhIL7e2Bu3/AlcY/S5zFYSSzXGaCVSRJ6H6BjD0LAxw==',
			payloadWrongSignature: '1452974164020\ntest\n1\n0\np49kAHUKHoSUysIf0yxiMDqBfwhs5EWGUVwNid85KcsudPquPPwAZG+3y56X5nP8cwN9yzlCgesl7y+cFBQ7vTBIuqVoOBVAx9Q37IQ8zGodBWkqDg0S193eclYDgubLjMHU54/xYFXLF8ivvqsD0npgUZcXndeBUnR2JVrnQ9kMh6PgbUvyaC85AjaUdWyG6zCOgCLRWO7bP9J0BKGwombF28TumTRtXlEU4Qjgn5GCeJlpzI4s0Qb4oiHUOoZWacunptGVZhyNvcZ5D0MrW0PbH3COLiXnPu1Ygw49hxAZhIL7e2Bu3/AlcY/S5zFYSSzXGaCVSRJ6H6BjD0LAxw==',
			data: {
				'String': "test",
				'Number': 0,
				'Boolean': true
			},
			dataUnkownOption: {
				'String': "test",
				'Number': 0,
				'Boolean': true,
				'Unkown': 1
			}
		} ],
		hormoneErr: [ {
			timestamp: 1452974164020,
			payload: '1452974164020\ntest\n1\n1\nrL88t4VRBzZWi1e8fubqXwfO6emcbCZ2DFd5TkutKoThNCx7THRJ08pRKrmyVYxTAxdh6my0CM/DLkN/GN8mf9HH9VZTtYCK2wKY48VjFrjbLseu1jIEfw8Kn7B+zIixkmjPJ6MlHdCUkmor/xAUp/KORW/riqtKVnkHWqvCFbTpFrKj8Y+tDjQKJEHl96UzctGCosBypvZWpVWyh4g8migp97nICEcHp8FI+y0J9Rk2uncMn/SP+OHIuYIF3NNH5sP37COdWXLc6wSMYYmjJFNg/nsLB8fDweLs56oc7V8DJ5H0sPQrGTjtdGRTlkCm3oLo0tSnTiIJnFzsoQAjPA==',
			data: {
				'String': "test",
				'Number': 1,
				'Boolean': true
			}
		} ]
	}
};

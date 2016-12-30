"use strict";

let pki = require( './pki.js' );

module.exports = {
	min: {
		name: "min",
		config: {
			freshness: 1,
			autoRefresh: true,
			dataFormat: []
		},
		origin: {
			issuer: {
				country: 'DE',
				state: 'NDS',
				locality: 'Hannover',
				organization: 'Internet Widgits Pty Ltd',
				organizationUnit: '',
				commonName: 'Internet Widgits Pty Ltd CA',
				dc: ''
			},
			serial: '1 (0x1)',
			country: 'DE',
			state: 'NDS',
			locality: 'Hannover',
			organization: 'Internet Widgits Pty Ltd',
			organizationUnit: '',
			commonName: 'Test Client',
			emailAddress: '',
			validity: { start: 1421603154000, end: 1516211154000 },
			dc: ''
		},
		definition: {
			payload: '{"cert":"-----BEGIN CERTIFICATE-----\\nMIIC0TCCAjoCAQEwDQYJKoZIhvcNAQEFBQAwdzELMAkGA1UEBhMCREUxDDAKBgNV\\nBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGEludGVybmV0IFdp\\nZGdpdHMgUHR5IEx0ZDEkMCIGA1UEAwwbSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRk\\nIENBMB4XDTE1MDExODE3NDU1NFoXDTE4MDExNzE3NDU1NFowZzELMAkGA1UEBhMC\\nREUxDDAKBgNVBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGElu\\ndGVybmV0IFdpZGdpdHMgUHR5IEx0ZDEUMBIGA1UEAwwLVGVzdCBDbGllbnQwggEi\\nMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC99vbZtOQwJPLv4po5DUpT3ZSm\\nnFlejCttofbITXCFujNqJQRX9/glpG3upsyv2ghpo24uzBgAdiOUiWNZLs/BIzkq\\nhe8mJNpnIAIQrwA1Hu/cb/mi/533gPD1rV4QOeJRkDxEY/KaZkFQvoRyUpYY64Kl\\n/pJvRqfHCzWnFpZKjsO9jc6V4soNNXlqd0sx/qvk/o3NHpDPRuKwQq7fI7Ur1srw\\n1K2DIvlasJPFf/cYrmZEhijyPrTq/RHsYcKJzHDj/WvWhW3vtG/7d7nVuRn58f/H\\n7wA2bj64UyA7xnSAta5KGEIW2bgrcYG3ajjTVL3rZzj971bKfPJeUQC+tNl/AgMB\\nAAEwDQYJKoZIhvcNAQEFBQADgYEAmjOmAyYbyZN75E7a5kjR7SP5ZQ+NUPiREZNa\\n3aH28pIDvxncv4UZBqeSFjRuyQ7BBBiyVaMak3Q9eoFYDsF9fMsVyipqV27H4vzb\\nIoHF1xEDFxCydSOeJ7WC2uCCEpGF7HJkqXa3X/BRdOMDCxGymCtDA5MGTcDxVM0I\\nnLBk9W4=\\n-----END CERTIFICATE-----","dataFormat":[],"freshness":1}\nA+7sbkCtbgEhPrOakOm9hx1im/Ld0SmrH/uZmBPCSfuFoNhJUQ8600L1TzqI/OzI3IA6kejYx7d1ZbEsfA2su/mGyhUs2ZInhyg2mMSpCm5fGeR0SchjPJ157UvNy6wInMNV4bfjKX+oBxmq0DWugj+RX4axIy0m0vO7SWF2pN7epoVoYm2UELzl/jnVupdLswqbodY2gx5DTkW5OiUq24zyBPjWozYU6Dwth3yzkN4mHC/tsCqGixR51+D92r9ptrFGmf420gujasP2mAE9Y+e5YQnoJ215iuaaQlGxGBfZP44vMWJLZUqq10X0SwG4ys+hi7SWHm9P05Aq1HiByA==',
			payloadWrongSignature: '{"cert":"-----BEGIN CERTIFICATE-----\\nMIIC0TCCAjoCAQEwDQYJKoZIhvcNAQEFBQAwdzELMAkGA1UEBhMCREUxDDAKBgNV\\nBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGEludGVybmV0IFdp\\nZGdpdHMgUHR5IEx0ZDEkMCIGA1UEAwwbSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRk\\nIENBMB4XDTE1MDExODE3NDU1NFoXDTE4MDExNzE3NDU1NFowZzELMAkGA1UEBhMC\\nREUxDDAKBgNVBAgMA05EUzERMA8GA1UEBwwISGFubm92ZXIxITAfBgNVBAoMGElu\\ndGVybmV0IFdpZGdpdHMgUHR5IEx0ZDEUMBIGA1UEAwwLVGVzdCBDbGllbnQwggEi\\nMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC99vbZtOQwJPLv4po5DUpT3ZSm\\nnFlejCttofbITXCFujNqJQRX9/glpG3upsyv2ghpo24uzBgAdiOUiWNZLs/BIzkq\\nhe8mJNpnIAIQrwA1Hu/cb/mi/533gPD1rV4QOeJRkDxEY/KaZkFQvoRyUpYY64Kl\\n/pJvRqfHCzWnFpZKjsO9jc6V4soNNXlqd0sx/qvk/o3NHpDPRuKwQq7fI7Ur1srw\\n1K2DIvlasJPFf/cYrmZEhijyPrTq/RHsYcKJzHDj/WvWhW3vtG/7d7nVuRn58f/H\\n7wA2bj64UyA7xnSAta5KGEIW2bgrcYG3ajjTVL3rZzj971bKfPJeUQC+tNl/AgMB\\nAAEwDQYJKoZIhvcNAQEFBQADgYEAmjOmAyYbyZN75E7a5kjR7SP5ZQ+NUPiREZNa\\n3aH28pIDvxncv4UZBqeSFjRuyQ7BBBiyVaMak3Q9eoFYDsF9fMsVyipqV27H4vzb\\nIoHF1xEDFxCydSOeJ7WC2uCCEpGF7HJkqXa3X/BRdOMDCxGymCtDA5MGTcDxVM0I\\nnLBk9W4=\\n-----END CERTIFICATE-----","dataFormat":[],"freshness":1}\nA+7sbkCtbgEhPrOakOm9hx1im/Ld0SmrH/uZmBPCSfuFoNhJUQ8600L1TzqI/OzI3IA6kejYx7d1ZbEsfA2su/mGyhUs2ZInhyg2mMSpCm5fGeR0SchjPJ157UvNy6wInMNV4bfjKX+oBxmq0DWugj+RX4axIy0m0vO7SWF2pN7epoVoYm2UELzl/jnVupdLswqbodY2gx5DTkW5OiUq24zyBPjWozYU6Dwth3yzkN4mHC/tsCqGixR51+D92r9ptrFGmf420gujasP2mAE9Y+e5YQnoJ215iuaaQlGxGBfZP44vMWJLZUzq10X0SwG4ys+hi7SWHm9P05Aq1HiByA==',
			payloadWrongCert: '{"cert":"bla","dataFormat":[]}\n XCpopdi62I8eNWKJ0Tc+Wch8m2TPBuC3F6fuhUk8zgnYetsjU7zqoelzvoqWK6vjG8wtbsjHLt99MP3sNCIxT7y9kddQq7cDxtb5eVZ9DN8Hg9T4wnISep4ZouyZO02x3xpTbM583lsd3vQcZSbjt1MiZscuxbRwsu3GtE3OVsNarQCvq+JHUA/pGSHEDzIVOJMV4F/uyvKNPB4KAIfI2QMu9rHbqFI6wdlJRGR0zlhlMqN0jlHvSUoL39lrvNzkKwKhR4+sSfVJgvqEtCEqJuBqB8PZpt8ZYuwQiHD80K9dMpjSw5tG7buM0PEN62DUfB7Vg7RPXXyHVk54+JejJg==',
			data: {
				cert: pki.cert,
				dataFormat: [],
				freshness: 1,
			},
			dataUnkownOption: {
				cert: pki.cert,
				dataFormat: [],
				freshness: 1,
				unkownOption: true
			},
			dataFormat: {},
			validity: { start: 1421603154000, end: 1516211154000 }
		},
		hormone: [ {
			timestamp: 1452974164020,
			payload: '1452974164020\nc8QJffNRqC8bO6MR5ML/50qU1cvXAMHDuFp68xCoGZEx+k5XWgNM8X1g6xVVOim0ZPGtIgtQnrWkMaSXtK8INr3TbVUBY9xs41T0O0iCb+Zr61Am9Q5UOcz1+Aomys2TogE6bH+Xc/uyNZdW0YzFGBvlYRlb6dqaNYgDI4aHAVQ+TywBwavE/zx9ZZrIfAh/VG6UOeoY1TThpyyVX1FfLRBPOp/U6IOrb4PO6P14+Mr+n4aSR1GL2XFDXEQyEXMV8Wbv3ALaAU9vxH/+g6Id4RqsvQw6iSIoHESwDaoutSNx5uGvp/etwp+6RN7aYsQXDSfRlcRYsnmmjHgBBBDorg==',
			data: {}
		} ]
	},
	max: {
		name: "max",
		config: {
			description: "Test Definition",
			check: "err=Number;",
			freshness: 1,
			autoRefresh: true,
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
		origin: {
			issuer: {
				country: 'DE',
				state: 'NDS',
				locality: 'Hannover',
				organization: 'Internet Widgits Pty Ltd',
				organizationUnit: '',
				commonName: 'Internet Widgits Pty Ltd CA',
				dc: ''
			},
			serial: '1 (0x1)',
			country: 'DE',
			state: 'NDS',
			locality: 'Hannover',
			organization: 'Internet Widgits Pty Ltd',
			organizationUnit: '',
			commonName: 'Test Client',
			emailAddress: '',
			validity: { start: 1421603154000, end: 1516211154000 },
			dc: ''
		},
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
			},
			validity: { start: 1421603154000, end: 1516211154000 }
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
		}, {
			timestamp: 1452974165020,
			payload: '1452974165020\ntest\n0\n0\nCPZXeokv7Vh3FRDNfR1jLa7E4M3ZXwcwMniufWyHV+q5cjyCVCHjwhqoFU1OU3gpEv7SUeXueuCRG/d5BCLBb1Xe/fPpBdhnXURyM0kPfaoKuXLE1nrze+FlXlslxZWf/ALMjNXm5pOjR+lgl0x2bXqFFf8kVQ+xUD0RdAp1kKxCbqcKkeCI6joY7BuRQo/Qetf2kAeYL3Jg6h0CusfmlBqrdkp+0SpfXLeb/f/07FzDQRO00xYC89DbtXW7eNJQnkws3NS/KhTZQCHbrcAPtDWwsLqHJ1ekMKCwR15dQHenunA9jPTcY0jIxW01AXStFVbulEi0qsiAZDI/RoMjYQ==',
			data: {
				'String': "test",
				'Number': 0,
				'Boolean': false
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

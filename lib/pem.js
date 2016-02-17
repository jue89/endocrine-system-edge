"use strict";

let pem = require( 'pem' );

class PEM {

	// data can be a certificate, a csr or a private key
	static getModulus( data ) {

		return new Promise( ( resolve, reject ) => {
			pem.getModulus( data, ( err, modulus ) => {
				if( err ) return reject( err );
				return resolve( modulus );
			} );
		} );

	}

	static verifySigningChain( cert, ca ) {

		return new Promise( ( resolve, reject ) => {
			pem.verifySigningChain( cert, ca, ( err, valid ) => {
				if( err ) return reject( err );
				return resolve( valid );
			} );
		} );

	}

	static readCertificateInfo( cert ) {

		return new Promise( ( resolve, reject ) => {
			pem.readCertificateInfo( cert, ( err, info ) => {
				if( err ) return reject( err );
				return resolve( info );
			} );
		} );

	}

	static getFingerprint( cert ) {

		return new Promise( ( resolve, reject ) => {
			pem.getFingerprint( cert, 'sha256', ( err, info ) => {
				if( err ) return reject( err );
				return resolve( info.fingerprint.toLowerCase() );
			} );
		} );

	}

}


module.exports = PEM;

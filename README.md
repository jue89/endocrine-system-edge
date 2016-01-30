# Endocrine System: Edge

Yes, you are still on GitHub. And no, this is not the *Pschyrembel*. (If you are familiar with the German language and own this medical dictionary, you really want to lookup *Steinlaus*!) This repository accomodates my approach to implement an application performance monitoring system. But it also can be used for inter-process communication across the whole network or even the Internet! In the future I will try to make my home *smart* with this system. It is written in Javascript (ES6) and offers a Node.JS (>=4.0.0) module. The whole system is based on a public key infrastructure (PKI). It will ensure, that the origin of every transmitted bit of data can be verified and that no data is manipulated on its way from sourc to sink.

The *Edge* of the Endocrine System emits and receives hormones. Hormones are datagrams that may contain information of any kind.

At the moment the project is more a prototype than something that should be used in productive systems. Check out the TODO.md for further details what is missing until this project can be considered as *finished*.


## Example

While running this example you should observe your MQTT broker and see the generated messages.

``` javascript
"use strict";

let os = require( 'os' );
let pki = require( './test/mocks/pki.js' );

// Establishing a connection to our MQTT broker.
// For further details check the connect method of MQTT.js out.
let es = require( './index.js' )( {
  key: pki.key,                         // Private key (PEM)
  cert: pki.cert,                       // Certificate (PEM)
  ca: pki.ca,                           // CA certificate (PEM)
  broker: 'mqtts://localhost',          // MQTTS broker
  prefix: os.hostname(),                // Prefix of all emitted hormones (optional)
  ignoreTimedrift: false                // Ignore timedrift. Might be handy for systems without internet connection
} );


// Define new glands that are going to emit hormones

// - First gland is a simple heartbeat
es.newGland(
  '',                                   // Name is the local hostname. Added by prefix
  {
    description: 'Heartbeat',           // Human-readable description
    freshness: 60,                      // Maximum age of received hormes
    autoRefresh: true                   // The system will take care of emitting this hormone
  }
);

// - Second gland is the current load
let loadGland = es.newGland(
  '/load',                              // Name is the local hostname + '/load'
  {
    description: 'Current Load',        // Human-readable description
    freshness: 60,                      // Maximum age of received hormes
    dataFormat: [                       // Define data points included in the hormone
      { name: 'load1', description: '1 Minute', type: 'number' },
      { name: 'load5', description: '5 Minutes', type: 'number' },
      { name: 'load15', description: '15 Minutes', type: 'number' }
    ],
    check: 'err = (load15 > 4) ? Math.ceil( load15 ) : 0' // Check function will be evaluated.
  }
);

// Since the load gland is not auto refreshed, we must take care of that
setInterval( () => {

  // Emit current load average
  let load = os.loadavg();
  loadGland.send( {
    load1: load[0],
    load5: load[0],
    load15: load[0]
  } );

}, 1000 );


// Define receptors, that listen to hormones

// - Heartbeats
es.newReceptor( '+' )
  .on( 'subscribe', ( name ) => {
    console.log( 'New host:', name );
  } )
  .on( 'unsubscribe', ( name ) => {
    console.log( 'Removed host:', name );
  } )
  .on( 'hormoneExpired', ( name ) => {
    console.log( 'We lost a host:', name );
  } );

// - Load
es.newReceptor( '+/load' )
  .on( 'hormoneError', ( name, hormone ) => {
    // The first part of the hormone name is the host name
    let host = name.substr( 0, name.indexOf( '/' ) );
    console.log( 'High load at host', name, hormone.data );
  } )
  .on( 'hormoneRecover', ( name, hormone ) => {
    // The first part of the hormone name is the host name
    let host = name.substr( 0, name.indexOf( '/' ) );
    console.log( 'Load okay at host', name, hormone.data );
  } );


// Listen for shutdown events and then shutdown the whole es gracefully
process.once( 'SIGINT', shutdown ).once( 'SIGTERM', shutdown );
function shutdown() {
  es.destroy().then( () => process.exit() );
}

```

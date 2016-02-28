# Endocrine System: Edge

Yes, you are still on GitHub. And no, this is not the *Pschyrembel*. (If you are familiar with the German language and own this medical dictionary, you really want to lookup *Steinlaus*!) This repository accomodates my approach to implement an application performance monitoring system. But it also can be used for inter-process communication across the whole network or even the Internet! In the future I will try to make my home *smart* with this system. It is written in Javascript (ES6) and offers a Node.JS (>=4.0.0) module. The whole system is based on a public key infrastructure (PKI). It will ensure that the origin of every transmitted bit of data can be verified and that no data is manipulated on its way from source to sink.

The *Edge* of the Endocrine System emits and receives hormones. Hormones are datagrams that may contain information of any kind.


## Example

While running this example you should observe your MQTT broker and see the generated messages.

``` javascript
"use strict";

const os = require( 'os' );
const ES = require( 'es-edge' );
const mdns = require( 'es-discovery-mdns' );
const pki = require( './test/mocks/pki.js' );

// Establishing a connection to our MQTT broker.
// For further details check the connect method of MQTT.js out.
let es = ES( {
  key: pki.key,                         // Private key (PEM)
  cert: pki.cert,                       // Certificate (PEM)
  ca: pki.ca,                           // CA certificate (PEM)
  core: [ mdns.discovery(60) ],         // The core will be found by mDNS. Timeout: 60s.
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
    autoRefresh: false                  // The system won't take care of emitting this hormone
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
    load5: load[1],
    load15: load[2]
  } );

}, 1000 );


// Define receptors, that listen to hormones

// - Heartbeats
es.newReceptor( '+' )
  .on( 'defined', ( name ) => {
    console.log( 'New host:', name );
  } )
  .on( 'undefined', ( name ) => {
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
  .on( 'hormoneRecovery', ( name, hormone ) => {
    // The first part of the hormone name is the host name
    let host = name.substr( 0, name.indexOf( '/' ) );
    console.log( 'Load okay at host', name, hormone.data );
  } );


// Listen for shutdown events and then shutdown the whole es gracefully
process.once( 'SIGINT', shutdown ).once( 'SIGTERM', shutdown );
function shutdown() {
  es.shutdown().then( () => process.exit() );
}

```

## API

The Endocrine System Edge system can be required as follows. The API description refers to ES.
``` javascript
const ES = require( 'es-edge' );
```

### Endocrine System

``` javascript
let es = ES( options );
```

Connects to an [Endocrine System Core](https://github.com/jue89/endocrine-system-core) and returns a connection handle.

```options``` can be:
 * ```cert```: Buffer containing the client certificate.
 * ```key```: Buffer containing the client key.
 * ```ca```: Buffer containing the certificate authority that signed the client certificate.
 * ```core```: Array of discovery services. The services will be used sequentially until the core has been discovered. The array takes functions, that returns a promise, or strings that will be interpreted as URL.
 * ```prefix```: (optional) Prefix for all glands.
 * ```ignoreTimedrift```: (optional) If set to true, the system won't check the accuracy of the local time.


### Class: Endocrine System

The connection handle ```es``` offers some events and methods:


#### Event: error

``` javascript
es.on( 'error', ( error ) => { ... } );
```

If an error occurs in the local Endocrine System instance or its glands or receptors, this event will be emitted.


#### Event: online

``` javascript
es.on( 'online', () => { ... } );
```

Will be emitted if the system goes online.


#### Event: offline

``` javascript
es.on( 'offline', () => { ... } );
```

Will be emitted if the system goes to McDonald's.


#### Property: online

``` javascript
let online = es.online;
```

Is set to true if the system is connected an Endocrine System Core.


#### Method: newGland

``` javascript
let gland = es.newGland( name, definition );
```

Creates a new gland that emits hormones. ```name``` is a string in the schema of MQTT topics. The prefix of the es will be prepended. ```definition``` can have the following options:

 * ```description```: (optional) Description of the hormone.
 * ```freshness```: (optional) Maximum timespan in seconds between two emitted hormones until the hormone is marked as unfresh. Default: 7200.
 * ```autoRefresh```: (optional) The system will reemit the last hormone in order to keep it fresh. Default: true.
 * ```dataFormat```: (optional) An array of data points that are attached to the hormone. Each data point has the following properies:
   * ```name```: Name of the data point.
   * ```description```: (optional) Description of the data point.
   * ```type```: Format of the data point. Can be: ```'string'```, ```'boolean'```, ```'number'```.
   * ```unit```: (optional) Unit of the data point.
 * ```check```: (optional) String with Javascript code that evaluates the hormone data. Data points are exposed with their names. The result must be stored in the variable ```err```. If ```err``` is larger than 0, the hormone is marked as erroneous.


#### Method: newReceptor

``` javascript
let receptor = es.newReceptor( filter, certCheck );
```

Creates a new receptor that receives hormones. ```filter``` is a string in the schema of MQTT topic subscriptions. The receptor will subscribe to hormones whose name matches to the filter. ```certCheck``` is an optional function that evaluates the sender's certificate and can decide whether or not to trust the sender. Example:

``` javascript
function certCheck( name, certInfo ) {
  // If the common name of the sender is Chuck Norris, the hormone will pass
  if( certInfo.commonName == 'Chuck Norris' ) return Promise.resolve();
  // Otherwise it will be rejected
  return Promise.reject( new Error( "We want Chuck Norris!" ) ;
}
```


#### Method: shutdown

``` javascript
es.shutdown();
```

Shuts down the endorcine system. All glands will be undefined, so they will disappear. A promise is returned, that will be resolved if the system has been successfully shut down.


### Class: Gland

The Method newGland will return an instance of Gland.

#### Event: defined

``` javascript
gland.on( 'defined', ( gland ) => { ... } );
```

Is fired if the gland has been successfully defined.


#### Event: sent

``` javascript
gland.on( 'sent', ( hormone ) => { ... } );
```

Is emitted if a hormone has been sent.


#### Event: shutdown

``` javascript
gland.on( 'shutdown', () => { ... } );
```

Is emitted if the gland has been shut down.


#### Event: error

``` javascript
gland.on( 'error', ( error ) => { ... } );
```


#### Method: send

``` javascript
gland.send( data );
```

Emits a new hormone with given data. ```data``` is an object containing all data points by name that will be attached to the hormone.


#### Method: shutdown

``` javascript
gland.shutdown();
```

Removes the gland. A promise is returned, that will be resolved if the gland has been successfully undefined.


### Class: Receptor

The Method newReceptor will return an instance of Receptor and listens to hormone defintions.

#### Event: defined

``` javascript
receptor.on( 'defined', ( name, definition ) => { ... } );
```

If the receptor recieved a hormone definition and it passed the cert check, the receptor will subscribe to emitted hormones and fires this event.


#### Event: refreshed

``` javascript
receptor.on( 'refreshed', ( name, definition ) => { ... } );
```

If the receptor received a hormone defintion again and nothing changed, the receptor won't undefine and define again. Instead it will just emit the refresh event.


#### Event: undefined

``` javascript
receptor.on( 'undefined', ( name ) => { ... } );
```

If a hormone definition is removed, the receptor will unsubscribe from the hormone.


#### Event: hormone

``` javascript
receptor.on( 'hormone', ( name, hormone ) => { ... } );
```

Everytime a hormone is received, this event will be fired.


#### Event: hormoneExpired

``` javascript
receptor.on( 'hormoneExpired', ( name, hormone ) => { ... } );
```

If a received hormone gets older than the specified freshness, this event will be emitted.


#### Event: hormoneRefresh

``` javascript
receptor.on( 'hormoneRefresh', ( name, hormone ) => { ... } );
```

Is emitted if a expired hormone gets refreshed


#### Event: hormoneError

``` javascript
receptor.on( 'hormoneError', ( name, hormone ) => { ... } );
```

This event is emitted if a hormone changed its error value evaluated by the check script and the error is larger than 0.


#### Event: hormoneRecovery

``` javascript
receptor.on( 'hormoneRecovery', ( name, hormone ) => { ... } );
```

This event is emitted if a hormone changed its error value evaluated by the check script and the error is less or equal 0.


#### Event: error

``` javascript
receptor.on( 'error', ( error ) => { ... } );
```

This will be emitted if a local error occured. We've done something wrong!


#### Event: receptionError

``` javascript
receptor.on( 'receptionError', ( error ) => { ... } );
```

This will be emitted if an error occured while processing data that we received. Someone else has probably done something wrong. We might want to log this, but someone else must solve this problem.


#### Property: hormones

``` javascript
let hormones = receptor.hormones;
```

An array of the latest received hormones of all subscribed hormone sources.


#### Property: expiredHormones

``` javascript
let expiredHormones = receptor.expiredHormones;
```

An array of the latest received hormones that expired.


#### Property: erroneousHormones

``` javascript
let erroneousHormones = receptor.erroneousHormones;
```

An array of the latest received hormones whose error value is larger than 0.


#### Property: goodHormones

``` javascript
let goodHormones = receptor.goodHormones;
```

An array of the latest received hormones that have not expired and whose error value is less or equal than 0.


#### Method: shutdown

``` javascript
receptor.shutdown();
```

Unsubcribes from all hormone sources and removes the receptor. A promise is returned, that will be resolved if the receptor has been successfully undefined.

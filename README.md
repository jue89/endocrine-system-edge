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
    autoRefresh: false,                 // The system won't take care of emitting this hormone
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
  .on( 'defined', ( env ) => {
    console.log( 'New host:', env.name );
  } )
  .on( 'undefined', ( env ) => {
    console.log( 'Removed host:', env.name );
  } )
  .on( 'hormoneExpiration', ( env ) => {
    console.log( 'We lost a host:', env.name );
  } );

// - Load
es.newReceptor( '+/load' )
  .on( 'hormoneError', ( env ) => {
    // The first part of the hormone name is the host name
    let host = env.name.substr( 0, env.name.indexOf( '/' ) );
    console.log( 'High load at host', env.name, env.data );
  } )
  .on( 'hormoneRecovery', ( env ) => {
    // The first part of the hormone name is the host name
    let host = env.name.substr( 0, env.name.indexOf( '/' ) );
    console.log( 'Load okay at host', env.name, env.data );
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
 * ```definitionResendInterval```: (optional) The interval in seconds between the hormone definitions are resend. Default: 21600s (6h)
 * ```reconnectTimeout```: (optional) Amount of seconds until the core will be rediscovered after a lost connection. If you are using a static Core address without any fancy discovery things, you want to set this value to ```null```. A reconnect to the same known Core will take place anyway. Warning: Inflight hormones will be destroyed. Default: 30s


### Class: Endocrine System

The connection handle ```es``` offers some events and methods:


#### Event: error

``` javascript
es.on( 'error', ( error, env ) => { ... } );
```

If an error occurs in the local Endocrine System instance, this event will be emitted. ```error``` is an instance of Error. ```env``` will give information about the environment in that the error occurred.


#### Event: connecting

``` javascript
es.on( 'connecting', ( env ) => { ... } );
```

Will be emitted if the tries to connect to the core. ```env``` is an object with the following items:
 * ```url```: The URL of the core. Is the result of the discovery process.

#### Event: online

``` javascript
es.on( 'online', ( env ) => { ... } );
```

Will be emitted if the system goes online. ```env``` is an object with the following items:
 * ```url```: The URL of the core.


#### Event: offline

``` javascript
es.on( 'offline', ( env ) => { ... } );
```

Will be emitted if the system goes to McDonald's. ```env``` is an object with the following items:
 * ```url```: The URL of the core to that the lost connection.


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
 * ```autoRefresh```: (optional) The system will emit the last hormone again in order to keep it fresh. Default: true.
 * ```dataFormat```: (optional) An array of data points that are attached to the hormone. Each data point has the following properties:
   * ```name```: Name of the data point.
   * ```description```: (optional) Description of the data point.
   * ```type```: Format of the data point. Can be: ```'string'```, ```'boolean'```, ```'number'```.
   * ```unit```: (optional) Unit of the data point.
 * ```check```: (optional) String with JavaScript code that evaluates the hormone data. Data points are exposed with their names. The result must be stored in the variable ```err```. If ```err``` is larger than 0, the hormone is marked as erroneous.


#### Method: newReceptor

``` javascript
let receptor = es.newReceptor( filter, certCheck );
```

Creates a new receptor that receives hormones. ```filter``` is a string in the schema of MQTT topic subscriptions. The receptor will subscribe to hormones which name matches the filter. ```certCheck``` is an optional function that evaluates the sender's certificate and can decide whether or not to trust the sender. Example:

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

Shuts down the endocrine system. All glands will be undefined, so they will disappear. A promise is returned, that will be resolved if the system has been successfully shut down.


### Class: Gland

The Method newGland will return an instance of Gland.

All emitted events are also forwarded to their parent ES instance.

#### Event: newGland

``` javascript
gland.on( 'newGland', ( env ) => { ... } );
```

Is fired if the gland has been successfully defined. ```env``` will give some information about the event:
 * ```origin```: The extracted certificate information of the origin. (Yes, in most cases we are the origin ;) But might be quite handy for debugging.)
 * ```name```: The name of the gland.
 * ```description```: Description ...
 * ```freshness```: Yes ... the data from the definition.
 * ```check```: Check function for evaluating the hormones.
 * ```dataFormat```: Format of the emitted hormones.


#### Event: removedGland

``` javascript
gland.on( 'removedGland', ( env ) => { ... } );
```

Is emitted if the gland has been shut down. ```env``` has the same format as Event 'newGland'.


#### Event: error

``` javascript
gland.on( 'error', ( error, env ) => { ... } );
```

If something went horribly wrong. ```error``` is an instance of Error. ```env``` has the same format as Event 'newGland'.


#### Event: sentHormone

``` javascript
gland.on( 'sentHormone', ( env ) => { ... } );
```

Is emitted if a hormone has been sent. ```env``` has the following format:
 * ```origin```: The extracted certificate information that signed this hormone.
 * ```name```: Hormone name.
 * ```sentAt```: Timestamp of the hormone.
 * ```data```: Attached information.
 * ```freshness```: Seconds the hormone will be fresh.
 * ```isFresh```: If ```freshness``` is less than zero, this will be false.
 * ```error```: The error code of the hormone.
 * ```isOK```: If ```error``` is less or equal than zero, this will be true.


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

The Method newReceptor will return an instance of Receptor and listens to hormone definitions.

All emitted events are also forwarded to their parent ES instance.

#### Event: newReceptor

``` javascript
receptor.on( 'newReceptor', ( error, env ) => { ... } );
```

This will be emitted if the receptor has been successfully set up. ```env``` will let you know:
 * ```filter```: The receptor filter.


#### Event: removedReceptor

``` javascript
gland.on( 'removedReceptor', ( env ) => { ... } );
```

Is emitted if the receptor has been shut down. ```env``` has the same format as Event 'newReceptor'.


#### Event: defined

``` javascript
receptor.on( 'defined', ( env ) => { ... } );
```

If the receptor received a hormone definition and it passed the cert check, the receptor will subscribe to emitted hormones and fires this event. ```env``` contains the following information:
 * ```origin```: The extracted certificate information of the origin.
 * ```name```: The name of the hormone.
 * ```description```: Description ...
 * ```freshness```: Freshness of a hormone.
 * ```check```: Check function for evaluating the hormones.
 * ```dataFormat```: Format of the emitted hormones.


#### Event: refreshed

``` javascript
receptor.on( 'refreshed', ( env ) => { ... } );
```

If the receptor received a hormone defintion again and nothing changed, the receptor won't undefine and define again. Instead it will just emit the refresh event. ```env``` contains the some information as described in the 'defined' event.


#### Event: undefined

``` javascript
receptor.on( 'undefined', ( name ) => { ... } );
```

If a hormone definition is removed, the receptor will unsubscribe from the hormone. ```env``` contains the some information as described in the 'defined' event.


#### Event: hormone

``` javascript
receptor.on( 'hormone', ( env ) => { ... } );
```

Everytime a hormone is received, this event will be fired. ```env``` will let you know:
 * ```origin```: The extracted certificate information that signed this hormone.
 * ```name```: Hormone name.
 * ```sentAt```: Timestamp of the hormone.
 * ```data```: Attached information.
 * ```freshness```: Seconds the hormone will be fresh.
 * ```isFresh```: If ```freshness``` is less than zero, this will be false.
 * ```error```: The error code of the hormone.
 * ```isOK```: If ```error``` is less or equal than zero, this will be true.


#### Event: hormoneExpiration

``` javascript
receptor.on( 'hormoneExpiration', ( env ) => { ... } );
```

If a received hormone gets older than the specified freshness, this event will be emitted. ```env``` has the same pattern as the 'hormone' evnet.


#### Event: hormoneRefresh

``` javascript
receptor.on( 'hormoneRefresh', ( env ) => { ... } );
```

Is emitted if a expired hormone gets refreshed. ```env``` has the same pattern as the 'hormone' evnet.


#### Event: hormoneError

``` javascript
receptor.on( 'hormoneError', ( env ) => { ... } );
```

This event is emitted if a hormone changed its error value evaluated by the check script and the error is larger than 0. ```env``` has the same pattern as the 'hormone' evnet.


#### Event: hormoneRecovery

``` javascript
receptor.on( 'hormoneRecovery', ( env ) => { ... } );
```

This event is emitted if a hormone changed its error value evaluated by the check script and the error is less or equal 0. ```env``` has the same pattern as the 'hormone' evnet.


#### Event: receptionError

``` javascript
receptor.on( 'receptionError', ( error, env ) => { ... } );
```

This will be emitted if an error occurred while processing data that we received. Someone else has probably done something wrong. We might want to log this, but someone else must solve this problem. ```env``` varies depending on where the actual problem occurred. Hopefully the field names are descriptive enough. If not, let me know!


#### Event: error

``` javascript
receptor.on( 'error', ( error, env ) => { ... } );
```

This will be emitted if a local error occurred. We've done something wrong! ```env``` will let you know:
 * ```filter```: The receptor filter.


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

An array of the latest received hormones which error value is larger than 0.


#### Property: goodHormones

``` javascript
let goodHormones = receptor.goodHormones;
```

An array of the latest received hormones that have not expired and which error value is less or equal than 0.


#### Method: shutdown

``` javascript
receptor.shutdown();
```

Unsubcribes from all hormone sources and removes the receptor. A promise is returned, that will be resolved if the receptor has been successfully undefined.

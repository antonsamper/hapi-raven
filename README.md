# hapi-raven-boom [![Build Status](https://travis-ci.org/antonsamper/hapi-raven-boom.svg?branch=master)](https://travis-ci.org/antonsamper/hapi-raven-boom)
A Hapi plugin for sending exceptions to Sentry.io through Raven. 

This is a fork of [@bendrucker's](https://github.com/bendrucker/hapi-raven) `hapi-raven@5.0.0` package that also
captures [Boom](https://github.com/hapijs/boom) responses automatically.


## Setup

Options:

* **`dsn`**: Your Sentry DSN (required)
* **`client`**: An options object that will be passed directly to the client as its second argument (optional)
* **`tags`**: An array of tags (strings) to apply to each captured error

Note that DSN configuration using `process.env` is not supported. If you wish to replicate the [default environment variable behavior](https://github.com/getsentry/raven-node/blob/master/lib/client.js#L21), you'll need to supply the value directly:

```js
server.register({
  register: require('hapi-raven'),
  options: {
    dsn: process.env.SENTRY_DSN
  }
})
```

## Usage

Once you register the plugin on a server, logging will happen automatically. 

The plugin listens for [`'request-error'` events](http://hapijs.com/api#server-events) which are emitted any time `reply` is called with an error where `err.isBoom === false`. Note that the `'request-error'` event is emitted for all thrown exceptions and passed errors that are not Boom errors. Transforming an error at an extension point (e.g. `'onPostHandler'` or `'onPreResponse'`) into a Boom error will not prevent the event from being emitted on response. 

--------------

#### Boom Non-500 Errors are Not Logged

```js
server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    reply(Hapi.error.notFound())
  }
})

server.inject('/', function (response) {
  // nothing was logged
})
```

#### 500 Errors are Logged

```js
server.route({
  method: 'GET',
  path: '/throw',
  handler: function (request, reply) {
    throw new Error()
  }
})

server.inject('/throw', function (response) {
  // thrown error is logged to Sentry
})
```

```js
server.route({
  method: 'GET',
  path: '/reply',
  handler: function (request, reply) {
    reply(new Error())
  }
})

server.inject('/throw', function (response) {
  // passed error is logged to Sentry
})
```

-------------------------

For convenience, the Raven client is exposed through `server.plugins['hapi-raven-boom'].client`.
This will allow you to capture non Boom errors, set the context and [more](https://docs.sentry.io/clients/node/). 

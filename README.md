# hapi-raven-boom [![Build Status](https://travis-ci.org/antonsamper/hapi-raven-boom.svg?branch=master)](https://travis-ci.org/antonsamper/hapi-raven-boom)
A Hapi plugin for sending exceptions to Sentry.io through Raven. 

This is a fork of [@bendrucker's](https://github.com/bendrucker/hapi-raven) `hapi-raven@5.0.0` package that also
captures [Boom](https://github.com/hapijs/boom) responses automatically.


## Requirements
The plugin is written in ES2016, please use **Node.js v4 or later**.


## Installation
Add `hapi-raven-boom` as a dependency to your project:

```bash
$ npm i -S hapi-raven-boom
```


## Usage
```javascript
const Hapi = require('hapi');
const Server = new Hapi.Server();
Server.connection();

Server.register({
    register: require('hapi-raven-boom'),
    options: {
        dsn: process.env.SENTRY_DSN,
        settings: {
            captureUnhandledRejections: true
        },
        tags: ['some-tag']
    },
}, (err) => {

    if (err) {
        return console.error(err);
    }
    
    Server.start(() => {
    
        console.info(`Server started at ${ Server.info.uri }`);
    });
});
```


## Plugin Options
* `dsn` - [REQUIRED] - Sentry DSN for the project.
* `settings` - [OPTIONAL] - An object with extra settings for the Sentry client. [See sentry configuration notes](https://docs.sentry.io/clients/node/config/)
* `tags` - [OPTIONAL] - An array of tags (strings) to apply to each captured event.


## Manually using the Raven client
For convenience, the Raven client is exposed through `server.plugins['hapi-raven-boom'].client`.
This will allow you to capture additional events, set the context and [more](https://docs.sentry.io/clients/node/).

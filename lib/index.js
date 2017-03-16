/*********************************************************************************
 1. Dependencies
 *********************************************************************************/

const Hoek = require('hoek');
const Raven = require('raven');
const Get = require('lodash/get');
const Trace = require('./trace');
const PluginPack = require('../package.json');


/*********************************************************************************
 2. Internals
 *********************************************************************************/

const internals = {};

internals.getRequestLevel = (request) => {

    return (Get(request, 'response.output.statusCode', '').toString().substr(0, 1) === '5') ? 'error' : 'info';
};

internals.getRequestData = (server, options, request, level) => {

    const requestInfo = Get(request, 'info', {});
    const serverInfo = Get(server, 'info', {});
    const url = requestInfo.uri ||
        requestInfo.host && `${serverInfo.protocol}://${requestInfo.host}` ||
        /* istanbul ignore next */
        serverInfo.uri;

    return {
        request: {
            method: request.method,
            query_string: request.query,
            headers: request.headers,
            cookies: request.state,
            url: url + request.path
        },
        extra: {
            timestamp: requestInfo.received,
            id: request.id,
            remoteAddress: Trace(request),
            remotePort: requestInfo.remotePort
        },
        tags: options.tags,
        level
    };
};

internals.onPreResponse = (server, options) => {

    return (request, reply) => {

        const requestResponse = Get(request, 'response', {});

        /* istanbul ignore else */
        if (requestResponse.isBoom === true) {
            let captureType;
            let captureDescription;
            const level = internals.getRequestLevel(request);

            if (level === 'error') {
                captureType = 'captureException';
                captureDescription = requestResponse;
            }
            else {
                captureType = 'captureMessage';
                captureDescription = requestResponse.message;
            }

            Raven[captureType](captureDescription, internals.getRequestData(server, options, request, level));
        }

        reply.continue();
    };
};


/*********************************************************************************
 3. Exports
 *********************************************************************************/

exports.register = (server, options, next) => {

    Hoek.assert(options.hasOwnProperty('dsn'), 'Missing `dsn` property');

    Raven.config(options.dsn, options.settings).install();

    server.ext('onPreResponse', internals.onPreResponse(server, options));
    server.expose('client', Raven);

    return next();
};

exports.register.attributes = {
    pkg: PluginPack
};

/*********************************************************************************
 1. Dependencies
 *********************************************************************************/

const Hoek = require('hoek');


/*********************************************************************************
 2. Exports
 *********************************************************************************/

module.exports = (request) => {

    Hoek.assert(request, 'Missing `request` object');
    Hoek.assert(request.headers, 'Missing `headers` property');
    Hoek.assert(request.info, 'Missing `info` property');

    const xFF = request.headers['x-forwarded-for'];
    return xFF ? xFF.split(',')[0] : request.info.remoteAddress;
};

'use strict';


/*********************************************************************************
 1. Dependencies
 *********************************************************************************/

const Trace = require('../');


/*********************************************************************************
 2. Tests
 *********************************************************************************/

describe('the trace function should...', () => {

    it('throw error when the request object is missing', () => {

        expect(() => {

            Trace();
        }).toThrowError('Missing `request` object');
    });

    it('throw error when the request.headers is missing', () => {

        expect(() => {

            Trace({});
        }).toThrowError('Missing `headers` property');
    });

    it('throw error when the request.headers is missing', () => {

        expect(() => {

            Trace({ headers: {} });
        }).toThrowError('Missing `info` property');
    });

    it('return the first item of the `x-forwarded-for` header', () => {

        const request = {
            headers: {
                'x-forwarded-for': 'xffheader'
            },
            info: {
                remoteAddress: 'remoteaddress'
            }
        };

        expect(Trace(request)).toBe('xffheader');
    });

    it('return the request remote address', () => {

        const request = {
            headers: {},
            info: {
                remoteAddress: 'remoteaddress'
            }
        };

        expect(Trace(request)).toBe('remoteaddress');
    });
});

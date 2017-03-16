/*********************************************************************************
 1. Mocks
 *********************************************************************************/

jest.mock('raven', () => {

    return {
        config: jest.fn(() => {

            return {
                install: jest.fn()
            };
        }),
        captureException: jest.fn(),
        captureMessage: jest.fn()
    };
});


/*********************************************************************************
 2. Dependencies
 *********************************************************************************/

const RavenBoomPlugin = require('../lib');
const Hapi = require('hapi');
const Hoek = require('hoek');
const Raven = require('raven');


/*********************************************************************************
 3. Exports
 *********************************************************************************/

describe('registration assertions', () => {

    it('should throw error when dsn is missing', () => {

        const server = new Hapi.Server();

        expect(() => {

            server.register({
                register: RavenBoomPlugin
            }, Hoek.ignore);
        }).toThrowError('Missing `dsn` property');
    });
});

describe('plugin functionality', () => {

    beforeEach(() => {

        Raven.config.mockClear();
    });

    it('should expose access to the raven client', (done) => {

        const server = new Hapi.Server();
        server.connection();

        server.register({
            register: RavenBoomPlugin,
            options: {
                dsn: null
            }
        }, (err) => {

            expect(err).toBeUndefined();
            expect(server.plugins['hapi-raven-boom']).toBeDefined();
            expect(server.plugins['hapi-raven-boom'].client).toBeDefined();
            expect(server.plugins['hapi-raven-boom'].client === Raven).toBe(true);
            done();
        });
    });

    it('should ensure the raven client is setup with the supplied settings', (done) => {

        const server = new Hapi.Server();

        server.connection();

        server.register({
            register: RavenBoomPlugin,
            options: {
                dsn: null,
                settings: {
                    foo: 'bar'
                }
            }
        }, (err) => {

            expect(err).toBeUndefined();
            expect(Raven.config).toHaveBeenCalledWith(null, { foo: 'bar' });
            done();
        });
    });

    it('should send an exception to sentry', (done) => {

        const server = new Hapi.Server();

        server.connection();

        server.route({
            method: 'GET',
            path: '/',
            handler: (request, reply) => {

                reply(new Error('test exception'));
            }
        });

        server.register({
            register: RavenBoomPlugin,
            options: {
                dsn: null,
                settings: {},
                tags: 'testing'
            }
        }, (err) => {

            expect(err).toBeUndefined();

            server.inject('/?foo=bar', (res) => {

                expect(res.statusCode).toEqual(500);
                expect(Raven.captureException).toHaveBeenCalledWith(new Error('test exception'), expect.objectContaining({
                    extra: {
                        id: expect.any(String),
                        remoteAddress: expect.any(String),
                        remotePort: expect.any(String),
                        timestamp: expect.any(Number)
                    },
                    level: 'error',
                    request: {
                        cookies: expect.any(Object),
                        headers: expect.any(Object),
                        method: 'get',
                        query_string: {
                            foo: 'bar'
                        },
                        url: expect.stringMatching(/^http:\/\/.+:0\/$/)
                    },
                    tags: 'testing'
                }));
                done();
            });
        });
    });

    it('should send a message to sentry', (done) => {

        const server = new Hapi.Server();

        server.connection();

        server.register({
            register: RavenBoomPlugin,
            options: {
                dsn: null,
                settings: {},
                tags: 'testing'
            }
        }, (err) => {

            expect(err).toBeUndefined();

            server.inject('/?foo=bar', (res) => {

                expect(res.statusCode).toEqual(404);
                expect(Raven.captureMessage).toHaveBeenCalledWith('Not Found', expect.objectContaining({
                    extra: {
                        id: expect.any(String),
                        remoteAddress: expect.any(String),
                        remotePort: expect.any(String),
                        timestamp: expect.any(Number)
                    },
                    level: 'info',
                    request: {
                        cookies: expect.any(Object),
                        headers: expect.any(Object),
                        method: 'get',
                        query_string: {
                            foo: 'bar'
                        },
                        url: expect.stringMatching(/^http:\/\/.+:0\/$/)
                    },
                    tags: 'testing'
                }));
                done();
            });
        });
    });
});

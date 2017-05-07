'use strict';

var Path = require('path');
var Should = require('should');
var SuperTest = require('supertest');
var IFNode = require('../');

/**
 *
 * @type {Application}
 */
var app = IFNode({
    project_folder: Path.resolve(__dirname, '../examples/controllers'),
    alias: 'cntllrs'
}).load();

/**
 *
 * @type {Application}
 */
var app_map = IFNode({
    project_folder: Path.resolve(__dirname, '../examples/controller_map'),
    alias: 'cntllrs_map'
}).load();

describe('Controllers', function() {
    describe('Controllers loading', function() {
        it('should throw doubling names error', function() {
            (function() {
                IFNode({
                    project_folder: Path.resolve(__dirname, '../examples/controllers_with_doubling_error'),
                    alias: 'controllers_with_doubling_error'
                }).load();
            }).should.throw();
        });

        it('should load controllers from custom folder', function() {
            var app = IFNode({
                project_folder: Path.resolve(__dirname, '../examples/controllers'),
                alias: 'controllers-from-custom-folder',
                environment: 'controllers-from-custom-folder'
            }).load();

            Should.exist(app.controllers.from_custom_folder);
        });
    });

    describe('app.Controller(options?: Object)', function() {
        it('default options', function() {
            app.controllers.main.root.should.be.equal('/');
            app.controllers.main.name.should.be.equal('main');

            app.controllers['api/~'].root.should.be.equal('/api/');
            app.controllers['api/~'].name.should.be.equal('api/~');

            app.controllers['api/v1/user'].root.should.be.equal('/api/v1/user/');
            app.controllers['api/v1/user'].name.should.be.equal('api/v1/user');
        });
    });

    describe('Controller instance', function() {
        describe('.param(name: string, expression: function)', function() {
            it('should get correct params', function() {
                (function() {
                    app.controllers.main.param('abc', /test/);
                }).should.throw();
                (function() {
                    app.controllers.main.param(/bad-name/, function() {});
                }).should.throw();
            });

            it('should create param checker', function() {
                app.controllers.main.param('param-checker', function() {
                });
            })
        });

        it('.before(...callbacks: Array<routeHandler>)', function(done) {
            SuperTest(app.listener)
                .get('/check_before')
                .expect({ check_before: 'invoked' }, done);
        });

        describe('options', function() {
            describe('.map', function() {
                it('should throw error', function() {
                    (function () {
                        IFNode({
                            project_folder: Path.resolve(__dirname, '../examples/controller_map_with_error'),
                            alias: 'cntllrs_map_with_error'
                        }).load();
                    }).should.throw();
                });

                it('get /', function(done) {
                    SuperTest(app_map.listener)
                        .get('/')
                        .expect('simple route', done);
                });
                it('get /with-error', function(done) {
                    SuperTest(app_map.listener)
                        .get('/with-error')
                        .expect(500, 'GET with error', done);
                });
                it('get /:param', function(done) {
                    SuperTest(app_map.listener)
                        .get('/1')
                        .expect({ id: 1, name: 'ilfroloff' }, done);
                });
                it('post /', function(done) {
                    SuperTest(app_map.listener)
                        .post('/')
                        .expect({ permanent: 'yes' }, done);
                });
                it('put /:id', function(done) {
                    SuperTest(app_map.listener)
                        .put('/1')
                        .expect('updated', done);
                });
                it('delete /:id', function(done) {
                    SuperTest(app_map.listener)
                        .delete('/1')
                        .expect({ custom: 'yes' }, done);
                });

                it('should prevent add route', function() {
                    (function() {
                        app_map.controllers.main.get(function() {});
                    }).should.throw();
                });
            });

            describe('.ajax', function() {
                it('should accept AJAX request', function(done) {
                    SuperTest(app.listener)
                        .get('/api/ajax-tests/accept-ajax')
                        .set('X-Requested-With', 'XMLHttpRequest')
                        .expect({
                            accept_ajax: true
                        }, done);
                });
                it('should except non-AJAX request', function(done) {
                    SuperTest(app.listener)
                        .get('/api/ajax-tests/accept-ajax')
                        .expect(400, done);
                });
                it('should accept non-AJAX request', function(done) {
                    SuperTest(app.listener)
                        .get('/api/ajax-tests/except-ajax')
                        .expect({
                            except_ajax: true
                        }, done);
                });
                it('should except AJAX request', function(done) {
                    SuperTest(app.listener)
                        .get('/api/ajax-tests/except-ajax')
                        .set('X-Requested-With', 'XMLHttpRequest')
                        .expect(400, done);
                });
            });

            it('permanent', function(done) {
                SuperTest(app.listener)
                    .get('/check_permanent_options')
                    .expect({ permanent: 'yes' }, done);
            });
            it('custom', function(done) {
                SuperTest(app.listener)
                    .get('/check_custom_options')
                    .expect({ custom: 'yes' }, done);
            });
        });

        describe('.method(method: string|Array, route?: string, options?: Object, handler: function)', function() {
            describe('map of methods', function() {
                it('default', function(done) {
                    SuperTest(app.listener)
                        .get('/')
                        .expect({
                            default: true,
                            default_special_options: true
                        }, done);
                });

                it('get', function(done) {
                    SuperTest(app.listener)
                        .get('/10')
                        .expect({ id: 10 }, done);
                });
                it('post', function(done) {
                    SuperTest(app.listener)
                        .post('/11')
                        .expect({ id: 11 }, done);
                });
                it('put', function(done) {
                    SuperTest(app.listener)
                        .put('/a')
                        .expect({ id: 0 }, done);
                });
                it('delete', function(done) {
                    SuperTest(app.listener)
                        .delete('/method-delete')
                        .expect('works', done);
                });
                it('del', function(done) {
                    SuperTest(app.listener)
                        .delete('/method-del')
                        .expect('works', done);
                });
                it('del, delete', function(done) {
                    SuperTest(app.listener)
                        .delete('/methods-delete')
                        .expect('works', done);
                });
            });

            it('should catch internal error and send to .error()', function(done) {
                SuperTest(app.listener)
                    .get('/api/v1/user')
                    .expect({
                        handled_by_api_v1_user: 'Unexpected error on handler'
                    }, done);
            });

            it('should returns status 404', function(done) {
                SuperTest(app.listener)
                    .delete('/api/v1/user/non-exists-route')
                    .expect(404, done);
            });

            it('should jump to next controller', function(done) {
                var url = '/api/jump/to/next';

                SuperTest(app.listener)
                    .get(url)
                    .expect({
                        echo: url
                    }, done)
            })
        });

        describe('.error(handler: function)', function() {
            it('fire', function(done) {
                SuperTest(app.listener)
                    .get('/error/fire')
                    .expect({ error: 'fire' }, done);
            });

            it('should throw unhandled error', function(done) {
                var app = IFNode({
                    project_folder: Path.resolve(__dirname, '../examples/controllers_with_unhandled_error'),
                    alias: 'controllers_with_unhandled_error'
                }).load();

                SuperTest(app.listener)
                    .get('/')
                    .expect(500, done);
            });
        });

        describe('.compile()', function() {
            Should.not.exist(app.controllers.main.compile());
        });
    });

    describe('Custom request/response options', function() {
        it('should throw error by redefining', function(done) {
            /**
             *
             * @type {Application}
             */
            var app = IFNode({
                project_folder: Path.resolve(__dirname, '../examples/controller_middleware_with_error'),
                alias: 'controller_middleware_with_error',
                environment: 'local'
            }).load();

            SuperTest(app.listener)
                .get('/')
                .expect(500, done);
        });

        it('response.ok(data: IFResponseData)', function(done) {
            SuperTest(app.listener)
                .get('/custom-response-methods/ok')
                .expect(200, done);
        });

        it('response.fail(data: IFResponseData)', function(done) {
            SuperTest(app.listener)
                .get('/custom-response-methods/fail')
                .expect(400, done);
        });

        it('response.bad_request(data: IFResponseData)', function(done) {
            SuperTest(app.listener)
                .get('/custom-response-methods/bad_request')
                .expect(400, done);
        });

        it('response.badRequest(data: IFResponseData)', function(done) {
            SuperTest(app.listener)
                .get('/custom-response-methods/badRequest')
                .expect(400, 'non-empty-data', done);
        });

        it('response.unauthorized(data: IFResponseData)', function(done) {
            SuperTest(app.listener)
                .get('/custom-response-methods/unauthorized')
                .expect(401, done);
        });

        it('response.forbidden(data: IFResponseData)', function(done) {
            SuperTest(app.listener)
                .get('/custom-response-methods/forbidden')
                .expect(403, done);
        });

        it('response.not_found(data: IFResponseData)', function(done) {
            SuperTest(app.listener)
                .get('/custom-response-methods/not_found')
                .expect(404, done);
        });

        it('response.notFound(data: IFResponseData)', function(done) {
            SuperTest(app.listener)
                .get('/custom-response-methods/notFound')
                .expect(404, done);
        });

        it('response.err(data: IFResponseData)', function(done) {
            SuperTest(app.listener)
                .get('/custom-response-methods/err')
                .expect(500, done);
        });

        it('response.error(data: IFResponseData)', function(done) {
            SuperTest(app.listener)
                .get('/custom-response-methods/error')
                .expect(500, 'non-empty-data', done);
        });

        it('should throw error about redefining', function(done) {
            SuperTest(app.listener)
                .get('/custom-response-methods/error')
                .expect(500, done);
        })
    });
});

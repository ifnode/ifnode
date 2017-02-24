'use strict';

var IFNode = require('../');
var Path = require('path');
var Should = require('should');
var SuperTest = require('supertest');

var app = IFNode({
    project_folder: Path.resolve(__dirname, '../examples/controllers'),
    alias: 'cntllrs'
}).load();

var app_map = IFNode({
    project_folder: Path.resolve(__dirname, '../examples/controller_map'),
    alias: 'cntllrs_map'
}).load();

describe('Controllers', function() {
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

        describe('options', function() {
            it('.before', function(done) {
                SuperTest(app.listener)
                    .get('/check_before')
                    .expect({ with_user: 'no' }, done);
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

            describe('.map', function() {
                it('get /', function(done) {
                    SuperTest(app_map.listener)
                        .get('/')
                        .expect('simple route', done);
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
            });
        });

        describe('.method(method: string|Array, route?: string, options?: Object, handler: function)', function() {
            describe('map of methods', function() {
                it('default', function(done) {
                    SuperTest(app.listener)
                        .get('/')
                        .expect({ default: true }, done);
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
        });
    });
});

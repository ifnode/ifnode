'use strict';

var ifnode = require('../'),
    path = require('path'),
    should = require('should'),
    request = require('supertest'),

    app = ifnode({
        project_folder: path.resolve(__dirname, '../examples/controllers'),
        alias: 'cntllrs'
    }).load();

describe('Controllers', function() {
    describe('app.Controller([options: Object])', function() {
        it('should exists', function() {
            var app = ifnode();

            app.Controller.should.be.an.Function;
        });

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
        describe('.param(name:String, expression:Function)', function() {
            it('shoes exists', function() {
                app.controllers.main.param.should.be.an.Function;
            });

            it('throw error', function() {
                (function() {
                    app.controllers.main.param(function() {});
                }).should.throw();
                (function() {
                    app.controllers.main.param('abc');
                }).should.throw();
            });
        });

        describe('.method(method: String|Array, [route: String], [options: Object], handler: Function)', function() {
            it('shoes exists', function() {
                app.controllers.main.method.should.be.an.Function;
            });

            describe('map of methods', function() {
                it('default', function(done) {
                    request(app.listener)
                        .get('/')
                        .expect({ default: true }, done);
                });

                it('get', function(done) {
                    request(app.listener)
                        .get('/10')
                        .expect({ id: 10 }, done);
                });
                it('post', function(done) {
                    request(app.listener)
                        .post('/11')
                        .expect({ id: 11 }, done);
                });
                it('put', function(done) {
                    request(app.listener)
                        .put('/a')
                        .expect({ id: 0 }, done);
                });
            });
        });

        describe('.error(handler: Function)', function() {
            it('fire', function(done) {
                request(app.listener)
                    .get('/error/fire')
                    .expect({ error: 'fire' }, done);
            });
        });
    });
});

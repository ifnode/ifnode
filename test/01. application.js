'use strict';

var ifnode = require('../'),
    path = require('path'),
    should = require('should');

describe('Application', function() {
    describe('initialize', function() {
        it('without parameters', function() {
            var app = ifnode(),
                app1 = ifnode();

            app.should.be.an.Object;
            app.should.be.equal(app1);
        });

        it('with parameters', function() {
            var application_path = path.resolve(__dirname, '../examples/config'),
                application_alias = 'application',
                env = 'local',
                app = ifnode({
                    project_folder: application_path,
                    alias: application_alias,
                    env: env
                });

            app.project_folder.should.be.equal(application_path);
            app.project_folder.should.be.equal(app.projectFolder);

            app.alias.should.be.equal(application_alias);

            app.config.should.be.an.Object;
            app.config.env.should.be.equal(env);
        });


        it('should few instances', function() {
            var app1 = ifnode({
                    alias: 'app1'
                }),
                app2 = ifnode({
                    alias: 'app2'
                });

            ifnode('app1').should.be.equal(app1);
            ifnode('app2').should.be.equal(app2);
        });
    });

    describe('app.register(name: String|module: Module|list_of_names: Array)', function() {
        it('not should empty', function() {
            var app = ifnode({
                alias: Math.random()
            });

            (function() {
                app.register();
            }).should.throw();
        });

        it('load by extension name', function(done) {
            var app = ifnode({
                project_folder: path.resolve(__dirname, '../examples/plugins'),
                alias: Math.random()
            });

            app.register('ifnode-plugins-internal');
            done();
        });

        it('load by module', function(done) {
            var app = ifnode({
                    project_folder: path.resolve(__dirname, '../examples/plugins'),
                    alias: Math.random()
                }),
                ifnode_plugin_external = require(path.resolve(__dirname, '../examples/plugins/node_modules/ifnode-plugins-external'));

            app.register(ifnode_plugin_external);
            done();
        });

        it('load by array', function(done) {
            var app = ifnode({
                    project_folder: path.resolve(__dirname, '../examples/plugins'),
                    alias: Math.random()
                }),
                ifnode_plugin_external = require(path.resolve(__dirname, '../examples/plugins/node_modules/ifnode-plugins-external'));

            app.register([
                'ifnode-plugin-internal',
                ifnode_plugin_external
            ]);
            done();
        });
    });
    describe('app.load([name: String|list: Array])', function() {
        it('empty', function() {
            var app = ifnode({
                alias: Math.random()
            });

            app.load();

            app.components.should.be.an.Object;
            app.models.should.be.an.Object;
            app.controllers.should.be.an.Object;
        });

        it('load by name', function() {
            var app = ifnode({
                alias: Math.random()
            });

            app.load('models');

            should.not.exists(app.components);
            app.models.should.be.an.Object;
            should.not.exists(app.controllers);
        });

        it('load by array', function() {
            var app = ifnode({
                alias: Math.random()
            });

            app.load([
                'models',
                'controllers'
            ]);

            should.not.exists(app.components);
            app.models.should.be.an.Object;
            app.controllers.should.be.an.Object;
        });
    });

    describe('app.run([callback: Function])', function() {
        it('without callback', function(done) {
            var app = ifnode({
                alias: Math.random()
            });

            app.run();
            app.down();
            done();
        });

        it('with callback', function(done) {
            var app = ifnode({
                alias: Math.random()
            });

            app.run(function(config) {
                this.should.be.equal(app);
                this.config.should.be.equal(config);

                app.down();
                done();
            });
        });
    });

    describe('app.down([callback: Function]', function() {
        it('without callback', function(done) {
            var app = ifnode({
                alias: Math.random()
            });

            app.run(function() {
                app.down();
                done();
            });
        });

        it('with callback', function(done) {
            var app = ifnode({
                alias: Math.random()
            });

            app.run(function() {
                app.down(function() {
                    done();
                });
            });
        });
    });
});

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
        });

        it('should be valid configuration', function() {
            var app = ifnode('application'),

                config = app.config,
                site_config = config.site;

            config.should.be.an.Object;

            config.env.should.be.equal('local');
            config.environment.should.be.equal('local');

            site_config.local.origin.should.be.equal('https://localhost:3000');
            site_config.global.ssl.key.should.be.equal(path.resolve(app.project_folder, 'path/to/key'));
            site_config.global.origin.should.be.equal('https://ifnode.com');

            config.application.express.should.be.an.Object;
            config.application.folders.should.be.an.Object;

            config.db.virtual.schema.should.be.equal('virtual');
        });

        it("should be non-editable configuration", function() {
            var app = ifnode('application');
            var config = app.config;

            (function() {
                config.site = {};
            }).should.throw();

            (function() {
                config.site.local = {};
            }).should.throw();

            (function() {
                config.site.local.origin = 'my custom origin';
            }).should.throw();
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
            var app = ifnode();

            (function() {
                app.register();
            }).should.throw();
        });

        it('load by extension name', function(done) {
            var app = ifnode({
                project_folder: path.resolve(__dirname, '../examples/plugins')
            });

            app.register('ifnode-plugins-internal');
            done();
        });

        it('load by module', function(done) {
            var app = ifnode({
                    project_folder: path.resolve(__dirname, '../examples/plugins')
                }),
                ifnode_plugin_external = require(path.resolve(__dirname, '../examples/plugins/node_modules/ifnode-plugins-external'));

            app.register(ifnode_plugin_external);
            done();
        });

        it('load by array', function(done) {
            var app = ifnode({
                    project_folder: path.resolve(__dirname, '../examples/plugins')
                }),
                ifnode_plugin_external = require(path.resolve(__dirname, '../examples/plugins/node_modules/ifnode-plugins-external'));

            app.register([
                'ifnode-plugin-internal',
                ifnode_plugin_external
            ]);
            done();
        });
    });
    describe('app.load()', function() {
        var app = ifnode();

        app.load();

        app.components.should.be.an.Object;
        app.models.should.be.an.Object;
        app.controllers.should.be.an.Object;
    });

    describe('app.run([callback: Function])', function() {
        it('without callback', function(done) {
            var app = ifnode();

            app.run();

            /**
             * setTimeout for node.js 0.10.x compatibility
             */
            setTimeout(function() {
                app.down();
                done();
            }, 10);
        });

        it('with callback', function(done) {
            var app = ifnode();

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
            var app = ifnode();

            app.run(function() {
                app.down();
                done();
            });
        });

        it('with callback', function(done) {
            var app = ifnode();

            app.run(function() {
                app.down(function() {
                    done();
                });
            });
        });
    });

    describe('app.require(id: String)', function() {
        var app = require('../examples/extensions/app');

        app.require('protected/extensions/a').should.have.property('value', 'a');
        app.require('./protected/extensions/a/b').should.have.property('value', 'a/b');
        app.require('app').should.be.equal(app);
        app.require('./../extensions/app').should.be.equal(app);
    });

    describe('app constants', function() {
        var app = ifnode();

        app.load();

        app.config.should.be.an.Object;
        app.server.should.be.an.Object;
        app.listener.should.be.a.Function;

        app.components.should.be.an.Object;
        app.models.should.be.an.Object;
        app.controllers.should.be.an.Object;

        app.id.should.be.a.String;
        app.alias.should.be.a.String;
        app.project_folder.should.be.a.String;
        app.projectFolder.should.be.a.String;
        app.backend_folder.should.be.a.String;
        app.backendFolder.should.be.a.String;
    });
});

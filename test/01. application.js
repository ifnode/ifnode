'use strict';

var Path = require('path');
var Should = require('should');
var IFNode = require('../');

describe('Application', function() {
    describe('app = new Application', function() {
        it('without parameters', function() {
            var app = IFNode();
            var app1 = IFNode();

            app.should.be.an.Object();
            app.should.be.equal(app1);
        });

        it('with parameters', function() {
            var application_path = Path.resolve(__dirname, '../examples/config');
            var application_alias = 'application';
            var env = 'local';
            var app = IFNode({
                project_folder: application_path,
                alias: application_alias,
                env: env
            });

            app.project_folder.should.be.equal(application_path);
            app.project_folder.should.be.equal(app.projectFolder);

            app.alias.should.be.equal(application_alias);
        });

        it('should be valid configuration', function() {
            var app = IFNode('application');
            var config = app.config;
            var site_config = config.site;

            config.should.be.an.Object();

            config.env.should.be.equal('local');
            config.environment.should.be.equal('local');

            site_config.local.origin.should.be.equal('https://localhost:3000');
            site_config.global.ssl.key.should.be.equal(Path.resolve(app.project_folder, 'path/to/key'));
            site_config.global.origin.should.be.equal('https://ifnode.com');

            config.application.express.should.be.an.Object();
            config.application.folders.should.be.an.Object();

            config.db.virtual.schema.should.be.equal('virtual');
        });

        it('should few instances', function() {
            var app1 = IFNode({
                alias: 'app1'
            });
            var app2 = IFNode({
                alias: 'app2'
            });

            IFNode('app1').should.be.equal(app1);
            IFNode('app2').should.be.equal(app2);
        });
    });

    describe('app properties', function() {
        var app = IFNode({
            alias: 'app-properties-check'
        });

        app.load();

        app.config.should.be.an.Object();
        app.server.should.be.an.Object();
        app.listener.should.be.a.Function();

        app.components.should.be.an.Object();
        app.models.should.be.an.Object();
        app.controllers.should.be.an.Object();

        app.id.should.be.a.String();
        app.alias.should.be.a.String();
        app.project_folder.should.be.a.String();
        app.projectFolder.should.be.a.String();
        app.backend_folder.should.be.a.String();
        app.backendFolder.should.be.a.String();
    });

    describe('app.require(id: string)', function() {
        var app = require('../examples/extensions/app');

        app.require('protected/extensions/a').should.have.property('value', 'a');
        app.require('./protected/extensions/a/b').should.have.property('value', 'a/b');
        app.require('app').should.be.equal(app);
        app.require('./../extensions/app').should.be.equal(app);
    });

    describe('app.register(module: string|Extension|Array<string|Extension>)', function() {
        it('not should empty', function() {
            var app = IFNode();

            (function() {
                app.register();
            }).should.throw();
        });

        it('load by extension name', function(done) {
            var app = IFNode({
                project_folder: Path.resolve(__dirname, '../examples/plugins')
            });

            app.register('ifnode-plugins-internal');
            done();
        });

        it('load by external name', function(done) {
            var app = IFNode({
                project_folder: Path.resolve(__dirname, '../examples/plugins')
            });
            var ifnode_plugin_external = Path.resolve(__dirname, '../examples/plugins/node_modules/ifnode-plugins-external');

            app.register(ifnode_plugin_external);
            done();
        });

        it('load by module', function(done) {
            var app = IFNode({
                project_folder: Path.resolve(__dirname, '../examples/plugins')
            });
            var ifnode_plugin_external = require(Path.resolve(__dirname, '../examples/plugins/node_modules/ifnode-plugins-external'));

            app.register(ifnode_plugin_external);
            done();
        });

        it('load by array', function(done) {
            var app = IFNode({
                    project_folder: Path.resolve(__dirname, '../examples/plugins')
                }),
                ifnode_plugin_external = require(Path.resolve(__dirname, '../examples/plugins/node_modules/ifnode-plugins-external'));

            app.register([
                'ifnode-plugins-internal',
                ifnode_plugin_external
            ]);
            done();
        });

        it('load schema, controller, component and mixed plugins', function() {
            var app = IFNode({
                project_folder: Path.resolve(__dirname, '../examples/plugins')
            });

            var internal_schema = require(Path.resolve(__dirname, '../examples/plugins/protected/extensions/internal-schema'));
            var internal_component = require(Path.resolve(__dirname, '../examples/plugins/protected/extensions/internal-component'));
            var internal_controller = require(Path.resolve(__dirname, '../examples/plugins/protected/extensions/internal-controller'));
            var external_mixed_module_path = Path.resolve(__dirname, '../examples/plugins/node_modules/external-mixed');

            app.register([
                'internal-schema',
                'internal-component',
                'internal-controller',
                external_mixed_module_path
            ]);

            var modules = app._modules;

            modules.should.containEql(internal_schema);
            modules.should.containEql(internal_component);
            modules.should.containEql(internal_controller);
            modules.should.containEql(require(external_mixed_module_path));
        });
    });

    describe('app.load()', function() {
        var app = IFNode({
            alias: 'app-load-test'
        });

        Should(app.components).be.a.null();
        Should(app.models).be.a.null();
        Should(app.controllers).be.a.null();

        app.load();

        app.components.should.be.an.Object();
        app.models.should.be.an.Object();
        app.controllers.should.be.an.Object();
    });

    describe('app.run(callback?: function)', function() {
        it('without callback', function(done) {
            var app = IFNode();

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
            var app = IFNode();

            app.run(function(config) {
                this.should.be.equal(app);
                this.config.should.be.equal(config);

                app.down();
                done();
            });
        });
    });

    describe('app.down(callback?: function)', function() {
        it('without callback', function(done) {
            var app = IFNode();

            app.run(function() {
                app.down();
                done();
            });
        });

        it('with callback', function(done) {
            var app = IFNode();

            app.run(function() {
                app.down(function() {
                    done();
                });
            });
        });
    });
});

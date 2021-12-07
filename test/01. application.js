'use strict';

var assert = require('assert');
var Path = require('path');
var Should = require('should');
var Component = require("../core/Component");
var IFNode = require('../');

describe('Application', function() {
    describe('app = new Application', function() {
        it('should throw error for wrong alias type', function() {
            (function() {
                IFNode({
                    alias: null
                });
            }).should.throw();
        });

        it('without parameters', function() {
            var app = IFNode();
            var app1 = IFNode();

            app.should.be.an.Object();
            app.should.be.equal(app1);
        });

        it('with parameters', function() {
            var application_path = Path.resolve(__dirname, '../examples/config');
            var application_alias = 'application';

            var app = IFNode({
                project_folder: application_path,
                alias: application_alias
            });

            app.project_folder.should.be.equal(application_path);
            app.project_folder.should.be.equal(app.projectFolder);

            app.alias.should.be.equal(application_alias);
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

    describe('should has base properties', function() {
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
        app.require('protected/extensions/a').should.have.property('value', 'a'); // get from module's cache
        app.require('./protected/extensions/a/b').should.have.property('value', 'a/b');
        app.require('app').should.be.equal(app);
        app.require('./../extensions/app').should.be.equal(app);
    });

    describe('app.register(module: string|Extension|Array<string|Extension>)', function() {
        it('shouldn\'t load empty', function() {
            var app = IFNode();

            (function() {
                app.register();
            }).should.throw();
        });

        it('shouldn\'t load non-exists plugin', function() {
            var app = IFNode();

            try {
                app.register('non-exists-plugin');
            } catch (error) {
                assert.ok(/Cannot\sfind\snode\smodule\sor\sextension/.test(error.message));
            }
        });

        it('should throw original error', function() {
            var app = require('../examples/extensions/app');

            try {
                app.register('with-syntax-error');
            } catch (error) {
                assert.ok(error instanceof SyntaxError);
            }
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

            app.load();

            var modules = app._modules;

            modules.should.containEql(internal_schema);
            modules.should.containEql(internal_component);
            modules.should.containEql(internal_controller);
            modules.should.containEql(require(external_mixed_module_path));
        });
    });

    describe('app.inject(instance)', function() {
        it('should inject component by id', function() {
            var app = IFNode({
                project_folder: Path.resolve(__dirname, '../examples/components'),
            }).load();

            app.inject('first').should.be.an.Object();
        });

        it('should inject component by class', function(done) {
            function Simple(options) {
                Component.call(this, options);
            }

            function WithConfig(options, injected_app) {
                Component.call(this, options);
                Should.deepEqual(this.config, {
                    passed: 'options'
                });
                Should.equal(injected_app, app);
            }

            WithConfig.prototype.finish_test = function() {
                done();
            }

            var app = IFNode({
                configuration: {
                    components: {
                        WithConfig: {
                            passed: 'options'
                        }
                    }
                }
            }).load();

            var component = app.inject(Simple);

            Should.equal(component.name, 'Simple');
            Should.equal(app.inject(Simple), component);

            component = app.inject(WithConfig)
            component.finish_test();
        })
    })

    describe('app.load()', function() {
        var app = IFNode({
            alias: 'app-load-test'
        });

        Should.equal(Object.keys(app.components).length, 0);
        Should.equal(Object.keys(app.models).length, 0);
        Should.equal(Object.keys(app.controllers).length, 0);

        app.load();

        app.components.should.be.an.Object();
        app.models.should.be.an.Object();
        app.controllers.should.be.an.Object();
    });

    describe('app.run(callback?: function)', function() {
        it('without callback', function(done) {
            var app = IFNode({
                alias: 'server-run-wt-callback'
            });

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
            var app = IFNode({
                alias: 'server-run-with-callback'
            });

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

'use strict';

var Path = require('path');
var Should = require('should');
var debug = require('debug')('ifnode:test:components');

/**
 *
 * @type {IFNode}
 */
var IFNode = require('../');
var app = IFNode({
    project_folder: Path.resolve(__dirname, '../examples/components'),
    env: 'local',
    alias: 'cmpts'
}).load();

describe('Components', function() {
    describe('app.component(id: string)', function() {
        it('should initialize component', function() {
            app.component('first').should.be.an.Object();
            app.component('component-in-folder').should.be.a.String();

            app.component('ClassES5').should.be.a.Function();
            app.component('ClassES5Component').should.be.not.a.Function();
        });

        it('should append methods', function() {
            app.component('third').custom().should.be.equal('is_custom');
        });

        it('should load internal component modules', function() {
            Should.equal(app.component('can-load-internal/other'), 'can-load-internal/other');
        });

        it('should be equal to app attached components', function() {
            Should.equal(app.first, app.component('first'));
        });

        it('should throw component internal error', function() {
            try {
                IFNode({
                    project_folder: Path.resolve(__dirname, '../examples/components_with_error'),
                }).load();
            } catch(error) {
                Should.equal(error.message, 'Unexpected component error');
            }
        });
    });

    describe('app.Component(custom_component_config?: Object)', function() {
        it('should exists', function () {
            app.Component.should.be.a.Function();
        });

        describe('should throw duplicating', function() {
            it('of components names', function() {
                (function() {
                    IFNode({
                        project_folder: Path.resolve(__dirname, '../examples/components_with_error'),
                        environment: 'names-duplicated'
                    }).load();
                }).should.throw();
            });
            it('of application property by name', function() {
                (function() {
                    IFNode({
                        project_folder: Path.resolve(__dirname, '../examples/components_with_error'),
                        environment: 'name-duplicated-app-prop'
                    }).load();
                }).should.throw();
            });
            it('of application property by alias', function() {
                (function() {
                    IFNode({
                        project_folder: Path.resolve(__dirname, '../examples/components_with_error'),
                        environment: 'alias-duplicated-app-prop'
                    }).load();
                }).should.throw();
            });
        });

        it('default options', function() {
            app.components.first.config.value.should.be.equal(1);
            app.components.second.config.should.be.equal('value');
            app.components.third.config.should.have.properties({});
        });

        it('application instance options', function() {
            app.first.config.value.should.be.equal(1);
            app.second.config.should.be.equal('value');
            app.third.config.should.have.properties({});
        });
    });

    describe('Class "Component" based components', function() {
        describe('ES5', function() {
            it('should has static and plain methods', function() {
                var ClassES5 = app.component('ClassES5');

                Should.equal(ClassES5.STATIC, 'ClassES5.STATIC');
                Should.equal(ClassES5.getStatic(), 'ClassES5.STATIC');
                Should.equal(ClassES5.getName(), 'ClassES5');

                Should.equal((new ClassES5).plain(), 'ClassES5#plain');
            });

            it('should attach component from class', function() {
                Should.equal(app.ClassES5Component.plain(), 'ClassES5Component#plain');
            });

            it('should attach component from instance', function() {
                Should.equal(app.ClassES5ComponentInstance.plain(), 'ClassES5ComponentInstance#plain');
            });

            it('should attach component with several inherits', function() {
                Should.equal(app.ClassES5ComponentDoubleInherits.base_plain(), 'Base#base_plain');
                Should.equal(app.ClassES5ComponentDoubleInherits.plain(), 'ClassES5ComponentDoubleInherits#child_plain');
            });
        });
    });

    describe('component instance', function() {
        it('.initialize(config: Object)', function () {
            app.second.initialized.should.be.true();
        });

        it('component has alias', function() {
            app.second.should.be.equal(app.second_alias);
            Should.not.exist(app.third_alias);
        });

        it('custom method', function() {
            app.third.custom().should.be.equal('is_custom');
        });
    });
});

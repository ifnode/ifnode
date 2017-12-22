'use strict';

require('should');
var Path = require('path');
var Should = require('should');
var SuperTest = require('supertest');
var IFNode = require('..');

var app = IFNode({
    project_folder: Path.resolve(__dirname, '../examples/plugins'),
    alias: 'plugins',
    environment: 'plugins'
});

app.register([
    'internal-component',
    'internal-component-class',
    'internal-another-ifnode-component-class',
    'internal-another-ifnode-component-es6-class',
    'defined-controller-plugin'
]);
app.load();

describe('Plugins', function() {
    it('should attach controller plugin', function(done) {
        SuperTest(app.listener)
            .get('/defined-controller-plugin')
            .expect('controller_plugin_option', done);
    });

    it('should has loaded plugin component', function() {
        Should.ok(
            app.component('PluginComponent') === app.PluginComponent &&
            app.PluginComponent === app.component('plugin_component') &&
            app.plugin_component === app.component('PluginComponent')
        );
    });

    it('should has loaded plugin class component', function() {
        Should.ok(
            app.component('PluginClassComponent') === app.plugin_class_component &&
            app.PluginClassComponent === app.component('plugin_class_component') &&
            app.plugin_class_component === app.component('PluginClassComponent')
        );
    });

    it('should has loaded plugin another ifnode class component', function() {
        Should.ok(
            app.component('PluginClassAnotherIFNodeComponent') === app.plugin_class_another_ifnode_component &&
            app.PluginClassAnotherIFNodeComponent === app.component('plugin_class_another_ifnode_component') &&
            app.plugin_class_another_ifnode_component === app.component('PluginClassAnotherIFNodeComponent')
        );
        Should.ok(
            app.component('PluginES6ClassAnotherIFNodeComponent') === app.plugin_es6_class_another_ifnode_component &&
            app.PluginES6ClassAnotherIFNodeComponent === app.component('plugin_es6_class_another_ifnode_component') &&
            app.plugin_es6_class_another_ifnode_component === app.component('PluginES6ClassAnotherIFNodeComponent')
        );
    });

    it('should load and compile components before application ones', function() {
        Should.equal(
            app.component('ApplicationComponent').get_plugin_component(),
            app.component('PluginComponent')
        );
    });

    it('should has correct configurations for plugins', function() {
        Should.deepEqual(app.component('PluginComponent').config, app.config.components.PluginComponent);
        Should.deepEqual(app.component('PluginClassComponent').config, app.config.components.PluginClassComponent);
    });
});

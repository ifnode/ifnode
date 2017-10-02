'use strict';

require('should');
var Path = require('path');
var Should = require('should');
var SuperTest = require('supertest');
var IFNode = require('..');

var app = IFNode({
    project_folder: Path.resolve(__dirname, '../examples/plugins'),
    alias: 'plugins'
});

app.register([
    'internal-component',
    'internal-component-class',
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

    it('should load and compile components before application ones', function() {
        Should.equal(
            app.component('ApplicationComponent').get_plugin_component(),
            app.component('PluginComponent')
        );
    });
});

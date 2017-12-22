'use strict';

var _defaults = require('lodash/defaults');
var Path = require('path');
var pathWithoutExtension = require('./../helper/pathWithoutExtension');

var Log = require('./../Log');
var Component = require('./../Component');

/**
 *
 * @class ComponentsBuilder
 *
 * @param {Object}  components
 * @param {Object}  [components_configs]
 */
function ComponentsBuilder(components, components_configs) {
    /**
     *
     * @type {Object.<string, Component>}
     */
    this.components = components;
    this.components_compiled = {};

    this._components_configs = components_configs || {};
    this._autoformed_config = null;
}

/**
 *
 * @param   {Object}    [custom_config]
 * @returns {Object}
 */
ComponentsBuilder.prototype.build_component_config = function build_component_config(custom_config) {
    custom_config = _defaults(custom_config || {}, this._autoformed_config);
    custom_config.config = (this._components_configs[custom_config.name]) || {};

    return custom_config;
};

/**
 *
 * @param   {string}    component_path
 * @returns {{ name: string }}
 */
ComponentsBuilder.prototype.build_and_memorize_config = function build_and_memorize_config(component_path) {
    var basename = Path.basename(component_path);

    this._autoformed_config = {
        name: pathWithoutExtension(basename)
    };

    return this._autoformed_config;
};


/**
 *
 * @param {string}  component_path
 * @param {Object}  component_config
 */
ComponentsBuilder.prototype.read_and_build_component = function read_and_build_component(component_path, component_config) {
    return this.build_component(require(component_path), component_config);
};

/**
 *
 * @param {*}       component
 * @param {Object}  component_config
 */
ComponentsBuilder.prototype.build_component = function build_component(component, component_config) {
    if(typeof component === 'function' && Component.isInheritsFrom(component)) {
        var component_name = component_config.name;
        var saved_component = this.components[component_name];

        if (
            saved_component &&
            saved_component.constructor === component &&
            saved_component.name === component_name
        ) {
            return saved_component;
        }

        component_config.name = component_config.name || component.name;
        component_config.config = _defaults(
            component_config.config || {},
            (this._components_configs[component_config.name])
        );

        component = new component(component_config);
    }

    return Component.isInstanceOf(component) ?
        this.save_component(component, component.name) :
        component;
};

/**
 *
 * @param   {ComponentOptions}  component_config
 * @returns {Component}
 */
ComponentsBuilder.prototype.make = function make(component_config) {
    return this.save_component(new Component(component_config), component_config.name);
};

/**
 *
 * @param   {Application}   app
 * @param   {string}        [component_path]
 * @returns {Object.<string, Component>}
 */
ComponentsBuilder.prototype.compile = function compile(app, component_path) {
    var self = this;
    var components = this.components;
    var components_compiled = this.components_compiled;

    Object.keys(components).forEach(function(unique_name) {
        if (components_compiled[unique_name]) {
            return;
        }

        if(unique_name in app) {
            Log.error('application', 'Alias [' + unique_name + '] already busy in application instance.');
        }

        var component = components[unique_name];

        if(component.initialize) {
            component.initialize(component.config);
        }

        components_compiled[unique_name] = true;
        app[unique_name] = component;

        component.alias.forEach(function(alias) {
            self.save_component(component, alias);
            components_compiled[alias] = true;

            if(alias in app) {
                Log.error('application', 'Alias [' + alias + '] already busy in application instance.');
            }

            app[alias] = component;
        });

        if(component_path) {
            self.save_component(component, component_path);
            components_compiled[component_path] = true;
        }
    });

    return components;
};

/**
 *
 * @param   {Component} component
 * @param   {string}    key
 * @returns {Component}
 */
ComponentsBuilder.prototype.save_component = function(component, key) {
    var saved_component = this.components[key];

    if(!saved_component) {
        return this.components[key] = component;
    } else if (saved_component === component) {
        return saved_component;
    }

    Log.error('components', 'Name [' + key + '] is already busy.');
};

module.exports = ComponentsBuilder;

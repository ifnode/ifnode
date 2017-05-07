'use strict';

var _defaults = require('lodash/defaults');
var Path = require('path');
var isInheritsFrom = require('./../helper/isInheritsFrom');
var pathWithoutExtension = require('./../helper/pathWithoutExtension');

var Log = require('./../Log');
var Component = require('./../Component');

/**
 *
 * @class ComponentsBuilder
 */
function ComponentsBuilder() {
    /**
     *
     * @type {Object.<string, Component>}
     */
    this.components = {};
    this._autoformed_config = null;
}

/**
 *
 * @param   {Object}    custom_config
 * @param   {Object}    [components_configs]
 * @returns {Object}
 */
ComponentsBuilder.prototype.build_component_config = function build_component_config(custom_config, components_configs) {
    custom_config = _defaults(custom_config || {}, this._autoformed_config);
    custom_config.config = (components_configs && components_configs[custom_config.name]) || {};

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
    var component = require(component_path);

    if(typeof component === 'function' && isInheritsFrom(component, Component)) {
        var component_name = component_config.name;
        var saved_component = this.components[component_name];

        if (
            saved_component &&
            saved_component.constructor === component &&
            saved_component.name === component_name
        ) {
            return saved_component;
        }

        component = new component(component_config);
    }

    return component instanceof Component ?
        this._save_component(component, component.name) :
        component;
};

/**
 *
 * @param   {Object}    component_config
 * @returns {Component}
 */
ComponentsBuilder.prototype.make = function make(component_config) {
    return this._save_component(new Component(component_config), component_config.name);
};

/**
 *
 * @param   {Application}   app
 * @returns {Object.<string, Component>}
 */
ComponentsBuilder.prototype.compile = function compile(app) {
    var self = this;
    var components = this.components;

    Object.keys(components).forEach(function(unique_name) {
        if(unique_name in app) {
            Log.error('application', 'Alias [' + unique_name + '] already busy in application instance.');
        }

        var component = components[unique_name];
        app[unique_name] = component;

        if(component.initialize) {
            component.initialize(component.config);
        }

        component.alias.forEach(function(alias) {
            self._save_component(component, alias);

            if(alias in app) {
                Log.error('application', 'Alias [' + alias + '] already busy in application instance.');
            }

            app[alias] = component;
        });
    });

    return components;
};

/**
 *
 * @private
 * @param   {Component} component
 * @param   {string}    key
 * @returns {Component}
 */
ComponentsBuilder.prototype._save_component = function(component, key) {
    var saved_component = this.components[key];

    if(!saved_component) {
        return this.components[key] = component;
    } else if (saved_component === component) {
        return saved_component;
    }

    Log.error('components', 'Name [' + key + '] is already busy.');
};

module.exports = ComponentsBuilder;

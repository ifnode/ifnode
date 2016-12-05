'use strict';

var _defaults = require('lodash/defaults');
var Path = require('path');
var toArray = require('./../helper/toArray');
var pathWithoutExtension = require('./../helper/pathWithoutExtension');

var Log = require('./../extensions/log');
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
 * @param   {Object}    custom_config
 * @param   {Object}    [components_configs]
 * @returns {Component}
 */
ComponentsBuilder.prototype.make = function make(custom_config, components_configs) {
    custom_config = _defaults(custom_config || {}, this._autoformed_config);

    var unique_name = custom_config.name;

    if(unique_name in this.components) {
        Log.error('components', 'Name [' + unique_name + '] already busy.');
    }

    custom_config.config = (components_configs && components_configs[unique_name]) || {};

    this.components[unique_name] = new Component(custom_config);

    return this.components[unique_name];
};

/**
 *
 * @param   {Application}   app
 * @returns {Object.<string, Component>}
 */
ComponentsBuilder.prototype.compile = function compile(app) {
    var components = this.components;

    Object.keys(components).forEach(function(unique_name) {
        var component = components[unique_name];
        app[unique_name] = component;

        if(component.initialize) {
            component.initialize(component.config);
        }

        toArray(component.alias).forEach(function(alias) {
            if(alias in components) {
                Log.error('components', 'Alias [' + alias + '] already busy in components.');
            }

            components[alias] = component;
            app[alias] = component;
        });
    });

    return components;
};

module.exports = ComponentsBuilder;

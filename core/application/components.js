'use strict';

var _defaults = require('lodash/defaults');
var toArray = require('./../helper/toArray');
var pathWithoutExtension = require('./../helper/pathWithoutExtension');

var Path = require('path');
var Diread = require('diread');

var Component = require('./../component');
var Log = require('./../extensions/log');

module.exports = function(Application) {
    var autoformed_config;

    Application.prototype._initialize_components = function() {
        Diread({
            src: this.config.application.folders.components,
            directories: true,
            level: 1,
            mask: function(path) {
                return path === pathWithoutExtension(path) ||
                    path.indexOf('.js') !== -1;
            }
        }).each(function(component_path) {
            var basename = Path.basename(component_path);

            autoformed_config = {
                name: pathWithoutExtension(basename)
            };

            try {
                require(component_path);
            } catch(error) {
                Log.warning('components', 'Cannot load component [' + autoformed_config.name + '] by path [' + component_path + ']');
            }
        });
    };
    Application.prototype._attach_components = function() {
        var self = this;
        var app_components = self._components;

        Object.keys(app_components).forEach(function(unique_name) {
            var component = app_components[unique_name];
            var aliases = toArray(component.alias);

            if(component.initialize) {
                component.initialize(component.config);
            }

            aliases.unshift(component.name);
            aliases.forEach(function(alias) {
                if(alias in self) {
                    Log.error('components', 'Alias [' + alias + '] already busy in application instance.');
                }

                self[alias] = component;
            });
        });
    };

    Application.prototype._init_components = function() {
        this._components = {};
        this._initialize_components();
        this._attach_components();
    };

    Application.prototype.Component = function(component_config) {
        component_config = _defaults(component_config || {}, autoformed_config);

        var unique_name = component_config.name;

        if(unique_name in this._components) {
            Log.error('components', 'Name [' + unique_name + '] already busy.');
        }

        component_config.config = this.config.components[unique_name] || {};

        this._components[unique_name] = new Component(component_config);

        return this._components[unique_name];
    };
};

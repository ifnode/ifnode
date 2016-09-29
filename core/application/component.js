'use strict';

var Path = require('path');
var Diread = require('diread');
var Component = require('./../component');

module.exports = function(Application) {
    Application.prototype._components = {};
    Application.prototype._initialize_components = function() {
        var custom_components_folder = this.config.application.folders.components;
        var custom_components_path = Path.resolve(this._project_folder, custom_components_folder);

        Diread({
            src: custom_components_path
        }).each(function(component_file_path) {
            require(component_file_path);
        });
    };
    Application.prototype._attach_components = function() {
        var self = this,
            app_components = self._components;

        Object.keys(app_components).forEach(function(component_key) {
            var component = app_components[component_key],
                component_aliases;

            if(component.disabled) {
                return;
            }

            component_aliases = component.alias;

            if(typeof component.initialize === 'function') {
                component.initialize(component.config);
            }

            self[component.name] = component;

            component_aliases.forEach(function(alias) {
                if(alias in self) {
                    throw new Error('Alias %s already busy in app', alias);
                }

                self[alias] = component;
            });
        });
    };

// TODO: think about helper and write components initialize
    Application.prototype._init_components = function() {
        this._initialize_components();
        this._attach_components();
    };

    Application.prototype.attach_component = function(component) {
        this._components[component.name] = component;
    };
    Application.prototype.Component = function(component_options) {
        var component = this._components[component_options.name];

        if(component) {
            return component;
        }

        component_options.config = this.config.components[component_options.name] || {};
        component = new Component(component_options);

        this._components[component.name] = component;

        return component;
    };
};

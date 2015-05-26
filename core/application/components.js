'use strict';

var debug = require('debug')('ifnode:components'),
    path = require('path'),
    diread = require('diread'),
    _ = require('lodash'),

    helper = require('./../helper'),
    log = require('./../extensions/log'),
    Component = require('./../component');

module.exports = function(Application) {
    var autoformed_config;

    Application.fn._initialize_components = function() {
        diread({
            src: this.config.application.folders.components
        }).each(function(component_file_path) {
            var basename = path.basename(component_file_path);

            autoformed_config = {
                name: helper.without_extension(basename)
            };

            require(component_file_path);
        });
    };
    Application.fn._attach_components = function() {
        var self = this,
            app_components = self._components;

        Object.keys(app_components).forEach(function(unique_name) {
            var component = app_components[unique_name],
                aliases = helper.to_array(component.alias);

            if(component.initialize) {
                component.initialize(component.config);
            }

            aliases.unshift(component.name);
            aliases.forEach(function(alias) {
                if(alias in self) {
                    log.error('components', 'Alias [' + alias + '] already busy in application instance.');
                }

                self[alias] = component;
            });
        });
    };

    Application.fn._init_components = function() {
        this._components = {};
        this._initialize_components();
        this._attach_components();
    };

    Application.fn.Component = function(component_config) {
        component_config = _.defaults(component_config || {}, autoformed_config);

        var unique_name = component_config.name;

        if(unique_name in this._components) {
            log.error('components', 'Name [' + unique_name + '] already busy.');
        }

        component_config.config = this._config.components[unique_name] || {};

        return this._components[unique_name] = Component(component_config);
    };
};

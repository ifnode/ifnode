var path = require('path'),
    diread = require('diread'),

    Component = require('./../component');

module.exports = function(Application) {
    var add_to = function(name, component, error_message) {
        if(name in this) {
            throw new Error(error_message);
        }

        return this[name] = component;
    };

    Application.fn._components = {};
    Application.fn._initialize_components = function() {
        var custom_components_folder = this.config.application.folders.components,
            custom_components_path = path.resolve(this._project_folder, custom_components_folder),

            cb = function(component_file_path) {
                require(component_file_path);
            };

        diread({ src: custom_components_path }).each(cb);
    };
    Application.fn._attach_components = function() {
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
                add_to.call(self, alias, component,
                    '[ifnode] [components] Alias already busy in application instance: ' + alias
                );
            });
        });
    };

    Application.fn._init_components = function() {
        this._initialize_components();
        this._attach_components();
    };

    Application.fn.Component = function(component_options) {
        var component = this._components[component_options.name];

        if(component) {
            return component;
        }

        component_options.config = this._config.components[component_options.name] || {};
        component = Component(component_options);

        return this._components[component.name] = component;
    };
};

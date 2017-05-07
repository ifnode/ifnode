'use strict';

var _isPlainObject = require('lodash/isPlainObject');
var _pairs = require('lodash/toPairs');

var Path = require('path');
var Express = require('express');

module.exports = function(Application) {
    Application.prototype._initialize_middleware = function(middleware_configs, app) {
        var self = this;
        var project_folder = this._project_folder;

        var ifnode_middleware = {
            'body': function(config) {
                var BodyParser = require('body-parser');

                Object.keys(config).forEach(function(method) {
                    app.use(BodyParser[method](config[method]));
                });
            },
            'statics': function(app_static_files) {
                var serveStatic = require('serve-static');

                /**
                 *
                 * @param {string}  static_file_config
                 */
                function by_string(static_file_config) {
                    app.use(serveStatic(Path.resolve(project_folder, static_file_config)));
                }

                /**
                 *
                 * @param {Object}  static_file_configs
                 */
                function by_object(static_file_configs) {
                    _pairs(static_file_configs).forEach(function(static_file_config) {
                        app.use(serveStatic(static_file_config[0], static_file_config[1]));
                    });
                }

                /**
                 *
                 * @param {string|Object}   static_file_config
                 */
                function initialize(static_file_config) {
                    if(typeof static_file_config === 'string') {
                        by_string(static_file_config);
                    } else {
                        by_object(static_file_config);
                    }
                }

                if(Array.isArray(app_static_files)) {
                    app_static_files.forEach(initialize);
                } else {
                    initialize(app_static_files);
                }
            }
        };

        var init_by_empty_config = function(name) {
                app.use(self._require_module(name)());
            },
            init_by_object_config = function(name, config) {
                app.use(self._require_module(name)(config));
            },
            init_by_array_config = function(name, config) {
                var module = self._require_module(name);

                app.use(module.apply(module, config));
            },
            init_by_function = function(name, fn) {
                fn(app, Express);
            };

        Object.keys(middleware_configs).forEach(function(middleware_name) {
            var middleware_config = middleware_configs[middleware_name];

            if(middleware_name in ifnode_middleware) {
                ifnode_middleware[middleware_name](middleware_config);
            } else {
                if(typeof middleware_config === 'function') {
                    init_by_function(middleware_name, middleware_config);
                } else if(Array.isArray(middleware_config)) {
                    if(!middleware_config.length) {
                        return init_by_empty_config(middleware_name);
                    }

                    init_by_array_config(middleware_name, middleware_config);
                } else {
                    if(!Object.keys(middleware_config).length) {
                        return init_by_empty_config(middleware_name);
                    }

                    init_by_object_config(middleware_name, middleware_config);
                }
            }
        });
    };
};

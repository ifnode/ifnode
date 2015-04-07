var path = require('path'),
    _ = require('lodash'),
    express = require('express');

module.exports = function(Application) {
    Application.fn._initialize_middleware = function(middleware_configs, app) {
        var project_folder = this._project_folder,

            ifnode_middleware = {
                'body': function(config) {
                    var body_parser = require('body-parser');

                    Object.keys(config).forEach(function(method) {
                        app.use(body_parser[method](config[method]));
                    });
                },
                'statics': function(app_static_files) {
                    var serve_static = require('serve-static'),

                        init = function(static_file_config) {
                            if(typeof static_file_config === 'string') {
                                by_string(static_file_config);
                            } else if(_.isPlainObject(static_file_config)) {
                                by_object(static_file_config);
                            }
                        },
                        by_string = function(static_file_config) {
                            app.use(serve_static(path.resolve(project_folder, static_file_config)));
                        },
                        by_object = function(static_file_config) {
                            static_file_config = _.pairs(static_file_config)[0];

                            app.use(serve_static(static_file_config[0], static_file_config[1]))
                        };

                    if(Array.isArray(app_static_files)) {
                        app_static_files.forEach(init);
                    } else {
                        init(app_static_files);
                    }
                }
            },

            init_by_empty_config = function(name) {
                app.use(require(name)());
            },
            init_by_object_config = function(name, config) {
                app.use(require(name)(config));
            },
            init_by_array_config = function(name, config) {
                var module = require(name);

                app.use(module.apply(module, config));
            },
            init_by_function = function(name, fn) {
                fn(app, express);
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
                } else if(_.isPlainObject(middleware_config)) {
                    if(!Object.keys(middleware_config).length) {
                        return init_by_empty_config(middleware_name);
                    }

                    init_by_object_config(middleware_name, middleware_config);
                }
            }
        });
    };
};

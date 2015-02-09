var fs = require('fs'),
    path = require('path'),
    diread = require('diread'),
    _ = require('lodash'),
    express = require('express'),

    helper = require('./helper'),
    define_properties = function(Application, properties) {
        var prototype_new_properties = {};

        Object.keys(properties).forEach(function(property_name) {
            var default_properties = {
                    //configurable: false,
                    enumerable: true,
                    //value: undefined,
                    //writable: false
                    //get: undefined,
                    //set: undefined
                },
                names = property_name.split(/\s*,\s*/),

                incoming_settings = properties[property_name],
                property_settings = {};

            if(typeof incoming_settings === 'function') {
                incoming_settings = { get: incoming_settings };
            }

            property_settings = _.defaults(incoming_settings, default_properties);

            names.forEach(function(name) {
                prototype_new_properties[name] = property_settings;
            });
        });

        Object.defineProperties(Application.fn, prototype_new_properties);
        Object.freeze(Application.fn);
    },

    Application = function(options) {
        if(!(this instanceof Application)) {
            return new Application(options);
        }
        this.init(options || {});
    };

Application.make = function(configuration) {
    return new Application(configuration);
};
Application.fn = Application.prototype;

Application.fn._init_config = function(environment) {
    var config_path;

    if(environment) {
        config_path = path.resolve(this._project_folder, 'config/', environment);
    }

    this._config = require('./config')({
        backend_folder: this._backend_folder,
        config_path: config_path
    });
};
Application.fn._init_http_server = function() {
    // TODO: initialize http or https server
    var http = require('http');

    return http.Server(this._server);
};

Application.fn._initialize_middlware = function(middleware_configs, app) {
    var config = this._config,
        app_config = config.application,
        project_folder = this._project_folder,

        ifnode_middleware = {
            'body': function(config) {
                var body_parser = require('body-parser');

                Object.keys(config).forEach(function(method) {
                    app.use(body_parser[method](config[method]));
                });
            },
            'session': function(session_config) {
                var session = require('express-session');

                if(session_config.store) {
                    (function() {
                        var store_db = config.by_path(session_config.store),
                            store;

                        if(!store_db) {
                            console.warn('Cannot find database config. Check please');
                            return;
                        }

                        if(store_db.type === 'mongoose') {
                            store = require('connect-mongo')(session);
                            session_config.store = new store({
                                db: store_db.config.database,
                                port: store_db.config.port
                            });
                        }
                        // TODO: add more db types for session stores
                    }());
                }
                app.use(session(session_config));
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

// TODO: move to file and make configurable
Application.fn._init_server = function() {
    var app = express(),
        config = this._config,
        app_config = config.application,

        middleware_configs = app_config.middleware,

        project_folder = this._project_folder,
        views_folder = app_config.folders.views,

        rest = require('./middleware/rest');

    app.use(rest.response());
    if(middleware_configs) {
        this._initialize_middlware(middleware_configs, app);
        app.use(rest.request());
    }

    app.set('view engine', app_config.view_engine || 'jade');
    app.set('views', path.resolve(project_folder, views_folder));

    this._server = app;
    this._http_server = this._init_http_server();
};

Application.fn._initialize_controller = function() {
    var self = this,
        controller_drivers_folder = path.resolve(this._ifnode_core_folder, 'controller-drivers/'),
        Controller = require('./controller');

    if(this._config.application && this._config.application.ws) {
        require(path.resolve(controller_drivers_folder, 'ws'))(self, Controller);
    }
    if(this._config.components && this._config.components.auth) {
        require(path.resolve(controller_drivers_folder, 'auth'))(self, Controller);
    }

    this._controller = Controller;
};
Application.fn._initialize_controllers = function() {
    var self = this,

        controllers_folder = this.config.application.folders.controllers,
        controllers_full_path = path.resolve(this._project_folder, controllers_folder),
        first_loaded_file = '!',
        last_loaded_file = '~',

        without_extension = function(path) {
            return path.split('.')[0];
        },
        read_controllers = function(main_folder, callback) {
            var regularize = function(directory_path, list) {
                    var is_directory = function(file_name) {
                            var file_path = path.join(directory_path, file_name);

                            return fs.statSync(file_path).isDirectory();
                        },
                        regularized = {
                            start: false,
                            directories: [],
                            files: [],
                            end: false
                        };

                    list.forEach(function(file_name) {
                        if(is_directory(file_name)) {
                            regularized.directories.push(file_name);
                        } else if(first_loaded_file === without_extension(path.basename(file_name))) {
                            regularized.start = file_name;
                        } else if(last_loaded_file === without_extension(path.basename(file_name))) {
                            regularized.end = file_name;
                        } else {
                            regularized.files.push(file_name);
                        }
                    });

                    return regularized;
                },

                read_file = function(full_file_path) {
                    var relavite_path = full_file_path.replace(main_folder, '');

                    callback(full_file_path, relavite_path);
                },

                read_directory = function(dir_path) {
                    var files = fs.readdirSync(dir_path),
                        read_parts = regularize(dir_path, files);

                    if(read_parts.start) {
                        read_file(path.join(dir_path, read_parts.start));
                    }

                    read_parts.directories.forEach(function(directory_name) {
                        read_directory(path.join(dir_path, directory_name));
                    });

                    read_parts.files.forEach(function(file_name) {
                        read_file(path.join(dir_path, file_name));
                    });

                    if(read_parts.end) {
                        read_file(path.join(dir_path, read_parts.end));
                    }
                };

            read_directory(main_folder);
        };

    this._autoformed_controller_config = {};

    if(fs.existsSync(controllers_full_path)) {
        read_controllers(controllers_full_path, function(controller_file_path, relative_path) {
            var root = without_extension(relative_path)
                    .replace(first_loaded_file, '')
                    .replace(last_loaded_file, '')
                    .replace(/\\/g, '/'),
                name = path.basename(root),

                config = {};

            if(name !== '') {
                config.name = name;
            }
            if(root !== '') {
                if(root[root.length - 1] !== '/') {
                    root += '/';
                }
                config.root = root;
            }

            self._autoformed_controller_config = config;

            require(controller_file_path);
        });
    }
};
Application.fn._compile_controllers = function() {
    var app_controllers = this._controllers,
        app_server = this._server;

    Object.keys(app_controllers).forEach(function(controller_id) {
        var controller = app_controllers[controller_id]

        app_server.use(controller.root, controller.router);
    });
};
Application.fn._init_controllers = function() {
    this._controllers = {};
    this._initialize_controller();
    this._initialize_controllers();
    this._compile_controllers();
};
Application.fn.Controller = function(controller_config) {
    if(!_.isPlainObject(controller_config)) {
        controller_config = {}
    }

    var autoformed_controller_config = this._autoformed_controller_config,
        config = _.defaults(controller_config, autoformed_controller_config),
        controller = this._controller(config);

    if(controller.name in this._controllers) {
        throw new Error('[ifnode] [controller] Controller with name "' + controller.name + '" already set.');
    }

    this._controllers[controller.name] = controller;

    return controller;
};

Application.fn._initialize_schemas = function() {
    var path = require('path'),
        model_drivers = require('./model-drivers')({
            user_model_drivers_folder: path.resolve(this._backend_folder, 'components/connections')
        }),

        self = this,
        db = this._config.db,
        app_schemas = this._schemas = {},

        db_connections_names;

    if(!db) {
        return;
    }

    db_connections_names = Object.keys(db);
    if(!db_connections_names.length) {
        return;
    }

    self._default_creator = db_connections_names[0];
    db_connections_names.forEach(function(db_connection_name) {
        var db_config = db[db_connection_name];

        if(db_config.default) {
            self._default_creator = db_connection_name;
        }

        app_schemas[db_connection_name] = model_drivers(db_config);
    });
};
Application.fn._initialize_models = function() {
    var models_folder = this.config.application.folders.models;

    diread({
        src: path.resolve(this._project_folder, models_folder)
    }).each(function(model_file_path) {
        require(model_file_path);
    });
};
Application.fn._compile_models = function() {
    var model_prototypes = this._model_prototypes,
        app_models = this._models,

        compile;

    compile = function(model_id) {
        var model_prototype = model_prototypes[model_id],
            compiled_model = model_prototype.__schema.compile(),
            options = model_prototype.options;

        app_models[model_id] = compiled_model;

        if(options.alias) {
            helper.to_array(options.alias).forEach(function(alias) {
                if(alias in app_models) {
                    throw new Error('Alias {' + alias + '} already busy');
                }

                app_models[alias] = compiled_model;
            });
        }
    };

    Object.keys(model_prototypes).forEach(compile);
    delete this.__model_prototypes;
};
Application.fn._init_models = function() {
    this._model_prototypes = {};

    this._models = {};
    this._initialize_schemas();
    this._initialize_models();
    this._compile_models();
};
Application.fn.Model = function(model_config, options) {
    if(typeof options !== 'undefined') {
        if(helper.is_plain_object(options)) {
            options.type = options.type || this._default_creator;
        } else {
            options = { type: options };
        }
    } else {
        options = { type: this._default_creator };
    }

    var schema = this._schemas[options.type](model_config);

    this._model_prototypes[schema.table] = {
        __schema: schema,
        options: options
    };

    return schema;
};

Application.fn._initialize_component_class = function() {
    this._component_class = require('./component');
};
Application.fn._initialize_components = function() {
    var custom_components_folder = this.config.application.folders.components,

        core_components_path = path.resolve(this._ifnode_core_folder, 'components/'),
        custom_components_path = path.resolve(this._project_folder, custom_components_folder),

        cb = function(component_file_path) {
            require(component_file_path);
        };

    diread({ src: core_components_path }).each(cb);
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
        };

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
Application.fn._init_components = function() {
    this._components = {};
    this._initialize_component_class();
    this._initialize_components();
    this._attach_components();
};
Application.fn.Component = function(component_options) {
    var component = this._components[component_options.name];

    if(component) {
        return component;
    }

    component_options.config = this._config.components[component_options.name] || {};
    component = this._component_class(component_options);

    return this._components[component.name] = component;
};

Application.fn._start_server = function(callback) {
    var app_instance = this,
        local_config = this._config.site.local,
        server_params = [];

    if(local_config.port) {
        server_params.push(local_config.port);
    }
    if(!_.contains(['127.0.0.1', 'localhost'], local_config.host)) {
        server_params.push(local_config.host);
    }
    if(typeof callback === 'function') {
        server_params.push(function() {
            callback.call(app_instance, app_instance.config);
        });
    }

    this._http_server.listen.apply(this._http_server, server_params);
};

Application.fn.run = function(callback) {
    this.load([
        'extensions',
        'components',
        'models',
        'controllers'
    ]);
    this._start_server(callback);
};

Application.fn.init = Application.fn.initialize = function(app_config) {
    this._id = helper.uid();
    this._alias = app_config.alias;

    this._ifnode_core_folder = __dirname;
    this._project_folder = app_config.project_folder || path.dirname(process.argv[1]);
    this._backend_folder = path.resolve(this._project_folder, 'protected/');

    this._init_config(app_config.env || app_config.environment);
    this._init_server();
};
Application.fn.load = function(parts) {
    var self = this,
        load_hash = {
            'extensions': '_initialize_extensions',
            'components': '_init_components',
            'models': '_init_models',
            'controllers': '_init_controllers'
        },
        load_module = {
            'components': ['component'],
            'models': ['schema'],
            'controllers': ['controller']
        },

        list_of_modules = this._modules,
        init_modules = function(type) {
            var modules = helper.to_array(list_of_modules),

                load_module = {
                    'schema': require('./model_schema'),
                    'component': require('./component'),
                    'controller': require('./controller')
                },

                args = load_module[type];

            modules.forEach(function(module) {
                var result;

                if(!(type in module)) {
                    return;
                }

                switch(type) {
                    case 'schema':
                        result = args();

                        module[type](self, result);
                        self.attach_schema(result);
                        break;
                    case 'component':
                        result = module[type](self, args);
                        self.attach_component(result);
                        break;
                    default:
                        console.log(module[type](self, args));
                }
            });
        };

    helper.to_array(parts).forEach(function(load_part) {
        load_module[load_part].forEach(init_modules);
        self[load_hash[load_part]]();
    });

    return this;
};

require('./application/extension')(Application);
require('./application/model')(Application);
require('./application/component')(Application);
require('./application/controller')(Application);

// TODO: think how make properties not editable
define_properties(Application, {
    'config': function() { return _.clone(this._config) },
    'server': function() { return this._server },

    'models':      function() { return this._models },
    'controllers': function() { return this._controllers },

    'id':    function() { return this._id },
    'alias': function() { return this._alias },
    'project_folder, projectFolder': function() { return this._project_folder },
    'backend_folder, backendFolder': function() { return this._backend_folder }
});

module.exports = Application;

var path = require('path'),
    _ = require('lodash'),
    express = require('express'),

    helper = require('./helper'),

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
Application.fn._define_properties = function(properties) {
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
};

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

Application.fn._initialize_middleware = function(middleware_configs, app) {
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
            fn(app, require('express'));
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
        this._initialize_middleware(middleware_configs, app);
        app.use(rest.request());
    }

    app.set('view engine', app_config.view_engine || 'jade');
    app.set('views', path.resolve(project_folder, views_folder));

    this._server = app;
    this._http_server = this._init_http_server();
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
    this.load();
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
Application.fn.load = function() {
    var self = this,
        load_hash = {
            'components': '_init_components',
            'models': '_init_models',
            'controllers': '_init_controllers'
        },
        load_module = {
            'components': ['component'],
            'models': ['schema'],
            'controllers': ['controller']
        },

        list_of_modules,
        init_modules = function(type) {
            var load_module = {
                    'schema': require('./model_schema'),
                    'component': self.Component.bind(self),
                    'controller': require('./controller')
                },

                args = load_module[type];

            list_of_modules.forEach(function(module) {
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
                    case 'controller':
                        module[type](self, args);
                        break;
                    default:
                        console.warn('[ifnode] [module] Unknown module type: ' + type);
                }
            });
        },

        require_module = function(module_name) {
            var module;

            try {
                module = require(module_name);
            } catch(e) {
                module = self.ext(module_name);
            }

            return module;
        };

    this._initialize_extensions();

    list_of_modules = this._modules = this._modules.map(function(module) {
        console.log(module);
        return typeof module === 'string'? require_module(module) : module;
    });

    [
        'components',
        'models',
        'controllers'
    ].forEach(function(load_part) {
        load_module[load_part].forEach(init_modules);
        self[load_hash[load_part]]();
    });

    return this;
};
Application.fn.register = function(list_of_modules) {
    this._modules = helper.to_array(list_of_modules);
};

require('./application/extensions')(Application);
require('./application/components')(Application);
require('./application/models')(Application);
require('./application/controllers')(Application);

// TODO: think how make properties not editable
Application.fn._define_properties({
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

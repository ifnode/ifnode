var path = require('path'),
    diread = require('diread'),
    _ = require('underscore'),

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
        app_path: this._project_folder,
        config_path: config_path
    });
};
Application.fn._init_http_server = function() {
    // TODO: initialize http or https server
    var http = require('http');

    return http.Server(this._server);
};
Application.fn._init_server = function() {
    var path = require('path'),
        fs = require('fs'),

        express = require('express'),
        method_override = require('express-method-override'),
        multiparty = require('connect-multiparty'),
        body_parser = require('body-parser'),
        cookie_parser = require('cookie-parser'),
        session = require('express-session'),
        serve_favicon = require('serve-favicon'),
        serve_static = require('serve-static'),
        //logger = require('morgan'),

        app = express(),
        config = this._config,
        app_config = config.application,
        session_config = app_config.session,
        app_static_files = app_config.statics,

        project_folder = this._project_folder,
        backend_folder = this._backend_folder,

        rest = require('./middleware/rest'),
        auth;

    app.set('view engine', app_config.view_engine || 'jade');
    app.set('views', path.resolve(backend_folder, 'views/'));

    if(typeof app_config.favicon === 'string') {
        app.use(serve_favicon(app_config.favicon));
    }
    app.use(body_parser.urlencoded({ extended: true }));
    app.use(body_parser.json());
    app.use(method_override());
    app.use(multiparty());
    app.use(cookie_parser());
    app.use(rest());

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
    app.use(session(app_config.session));

    if(Array.isArray(app_static_files)) {
        app_static_files.forEach(function(file_path) {
            app.use(serve_static(path.resolve(project_folder, file_path)));
        });
    } else if(typeof app_static_files === 'string') {
        app.use(serve_static(path.resolve(project_folder, app_static_files)));
    }

    if(app_config.debug === true) {
        // TODO: check logger module (check node-bunyan)
        //app.use(logger('dev'));
    }

    if(config.auth) {
        // TODO: auth how component
        auth = require('./middleware/auth')(this);
        app.use(auth.initialize());
        app.use(auth.session());
        this.auth = auth;
    }

    this._server = app;
    this._http_server = this._init_http_server();
};

Application.fn._initialize_controller = function() {
    var Controller = require('./controller');

    if(this.config.application.ws) {
        require('./controller-drivers/ws')(this, Controller);
    }

    this._controller = Controller;
};
Application.fn._initialize_controllers = function() {
    diread({
        src: path.resolve(this._backend_folder, 'controllers/')
    }).each(function(controller_file_path) {
        require(controller_file_path);
    });
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
    var controller = this._controller(controller_config);

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
        app_schemas = this._schemas = {};

    Object.keys(db).forEach(function(db_connection_name) {
        var db_config = db[db_connection_name];

        if(db_config.default) {
            self._default_creator = db_connection_name;
        }

        app_schemas[db_connection_name] = model_drivers(db_config);
    });
};
Application.fn._initialize_models = function() {
    var app_models = this._models;

    diread({
        src: path.resolve(this._backend_folder, 'models/')
    }).each(function(model_file_path) {
        require(model_file_path);
    });
};
Application.fn._compile_models = function() {
    var app_models = this._models;

    Object.keys(app_models).forEach(function(model_id) {
        app_models[model_id].compile();
        app_models[model_id] = app_models[model_id]._model;
    });
};
Application.fn._init_models = function() {
    this._models = {};
    this._initialize_schemas();
    this._initialize_models();
    this._compile_models();
};
Application.fn.Model = function(model_config, creator_name) {
    var schema = this._schemas[creator_name || this._default_creator](model_config);

    this._models[schema.table] = schema;

    return schema;
};

Application.fn._initialize_component_class = function() {
    this._component_class = require('./component');
};
Application.fn._initialize_components = function() {
    var self = this,
        core_components_path = path.resolve(this._ifnode_core_folder, 'components/'),
        custom_components_path = path.resolve(this._backend_folder, 'components/');

    var cb = function(component_file_path) {
        var component_data = require(component_file_path);

        if(component_data) {
            var helper = _.extend(component_data, Application.fn.helper);

            Object.keys(helper).forEach(function(fn) {
                if(typeof helper[fn] === 'function') {
                    helper[fn] = helper[fn].bind(helper);
                }
            });

            self.helper = helper;
        }
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
        'components',
        'models',
        'controllers'
    ]);
    this._start_server(callback);
};

Application.fn.init = Application.fn.initialize = function(app_config) {
    this._ifnode_core_folder = __dirname;
    this._project_folder = app_config.project_folder || path.dirname(process.argv[1]);
    this._backend_folder = path.resolve(this._project_folder, 'protected/');

    this._init_config(app_config.env || app_config.environment);
    this._init_server();
};
Application.fn.load = function(parts) {
    var load_hash = {
            'components': '_init_components',
            'models': '_init_models',
            'controllers': '_init_controllers'
        },
        self = this;

    parts.forEach(function(load_part) {
        self[load_hash[load_part]]();
    });

    return this;
};

// TODO: think how make properties not editable
Application.fn._define_properties({
    'config': function() { return _.clone(this._config) },
    'server': function() { return this._server },

    'models': function() { return this._models },
    'controllers': function() { return this._controllers },

    'project_folder, projectFolder': function() { return this._project_folder },
    'backend_folder, backendFolder': function() { return this._backend_folder }
});

module.exports = Application;

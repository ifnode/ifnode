'use strict';

var debug = require('debug')('ifnode:application'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    express = require('express'),

    helper = require('./helper'),
    log = require('./extensions/log'),

    Application = function(options) {
        if(!(this instanceof Application)) {
            return new Application(options || {});
        }

        _initialize.call(this, options || {});
    },

    _initialize = function(app_config) {
        if(app_config.alias && typeof app_config.alias !== 'string') {
            log.error('application', 'Alias must be String');
        }

        this.id = helper.uid();
        this.alias = app_config.alias || this.id;

        this._project_folder = app_config.project_folder || app_config.projectFolder || path.dirname(process.argv[1]);
        this._backend_folder = path.resolve(this._project_folder, 'protected/');

        _initialize_config.call(this, app_config.env || app_config.environment);
        _initialize_listener.call(this);
        _initialize_server.call(this);

        return this;
    },

    _initialize_config = function(environment) {
        var config_path;

        if(environment) {
            config_path = path.resolve(this._project_folder, 'config/', environment);
        }

        this._config = require('./config')({
            environment: environment,
            project_folder: this._project_folder,
            backend_folder: this._backend_folder,
            config_path: config_path
        });
    },
    _initialize_listener = function() {
        var app = express(),
            config = this._config,
            app_config = config.application,

            middleware_configs = app_config.middleware,
            express_configs = app_config.express,

            rest = require('./middleware/rest');

        app.use(rest.response());
        if(middleware_configs) {
            this._initialize_middleware(middleware_configs, app);
            app.use(rest.request());
        }

        Object.keys(express_configs).forEach(function(express_option) {
            app.set(express_option, express_configs[express_option]);
        });

        this._listener = app;
    },
    _initialize_server = function() {
        var server,
            credentials = this._config.site.local.ssl;

        if(_.isPlainObject(credentials)) {
            if(credentials.pfx) {
                credentials = {
                    pfx: fs.readFileSync(credentials.pfx, 'utf8')
                };
            } else if(credentials.key && credentials.cert) {
                credentials = {
                    key: fs.readFileSync(credentials.key, 'utf8'),
                    cert: fs.readFileSync(credentials.cert, 'utf8')
                };
            } else {
                log.error('application', 'Wrong https credentials');
            }

            server = require('https').createServer(credentials, this._listener);
        } else {
            server = require('http').createServer(this._listener);
        }

        this._server = server;
    },
    _start_server = function(callback) {
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

        this._server.listen.apply(this._server, server_params);
    },
    _stop_server = function(callback) {
        this._server.close.call(this._server, callback);
    };

Application.fn = Application.prototype;

require('./application/middleware')(Application);
require('./application/extensions')(Application);
require('./application/components')(Application);
require('./application/models')(Application);
require('./application/controllers')(Application);


Application.fn.register = function(module) {
    var type_of = typeof module;

    if(
        type_of === 'string' ||
        Array.isArray(module) ||
        (type_of !== 'undefined' && type_of !== 'number')
    ) {
        this._modules = helper.to_array(module);

        return this;
    }

    log.error('plugins', 'Wrong plugin type');
};
Application.fn.load = function() {
    var app = this,

        initialize_models = function() {
            var type = 'schema',
                model_schema = require('./model_schema'),
                modules = app._modules,

                i,
                schema,
                module;

            for(i = 0; i < modules.length; ++i) {
                module = modules[i][type];

                if(module) {
                    schema = model_schema();
                    module(app, schema);
                    app.attach_schema(schema);
                }
            }

            app._init_models();
        },
        initialize_components = function() {
            var type = 'component',
                Component = app.Component.bind(app),
                modules = app._modules,

                i, module;

            app._components = {};
            app._initialize_components();

            for(i = 0; i < modules.length; ++i) {
                module = modules[i][type];

                if(module) {
                    module(app, Component);
                }
            }

            app._attach_components();
        },
        initialize_controllers = function() {
            var type = 'controller',
                Controller = require('./controller'),
                modules = app._modules,

                i, module;

            for(i = 0; i < modules.length; ++i) {
                module = modules[i][type];

                if(module) {
                    module(app, Controller);
                }
            }

            app._init_controllers();
        },

        initialize_modules = function() {
            var modules = app._modules;

            modules = helper.to_array(modules).map(function(module) {
                return typeof module === 'string'? require_module(module) : module;
            });

            modules.push(require('./../plugins/ifnode-virtual'));

            app._modules = modules;
        },

        require_module = function(module_name) {
            var module;

            try {
                module = require(module_name);
            } catch(e) {
                module = app.ext(module_name);
            }

            return module;
        };

    initialize_modules();
    initialize_models();
    initialize_components();
    initialize_controllers();

    this._is_loaded = true;

    return this;
};
Application.fn.run = function(callback) {
    !this._is_loaded && this.load();
    _start_server.call(this, callback);
};
Application.fn.down = function(callback) {
    _stop_server.call(this, callback);
};

helper.define_properties(Application.fn, {
    'project_folder, projectFolder': function() { return this._project_folder },
    'backend_folder, backendFolder': function() { return this._backend_folder },

    'config': function() { return this._config },
    'server': function() { return this._server },
    'listener': function() { return this._listener },

    'components':  function() { return this._components },
    'models':      function() { return this._models },
    'controllers': function() { return this._controllers }
});

module.exports = Application;

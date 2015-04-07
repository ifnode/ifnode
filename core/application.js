var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    express = require('express'),
    helper = require('./helper'),

    Application = function(options) {
        if(!(this instanceof Application)) {
            return new Application(options || {});
        }
        this.initialize(options || {});
    },

    _initialize_config = function(environment) {
        var config_path;

        if(environment) {
            config_path = path.resolve(this._project_folder, 'config/', environment);
        }

        this._config = require('./config')({
            project_folder: this._project_folder,
            backend_folder: this._backend_folder,
            config_path: config_path
        });
    },
    _initialize_http_server = function() {
        var server,
            credentials = this._config.site.ssl;

        if(credentials) {
            server = require('https');
            credentials = {
                key: fs.readFileSync(credentials.key, 'utf8'),
                cert: fs.readFileSync(credentials.cert, 'utf8')
            };

            return server.createServer(credentials, this._server);
        } else {
            server = require('http');

            return server.createServer(this._server);
        }
    },
    _initialize_server = function() {
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
        this._http_server = _initialize_http_server.call(this);
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

        this._http_server.listen.apply(this._http_server, server_params);
    };

Application.fn = Application.prototype;

require('./application/middleware')(Application);
require('./application/extensions')(Application);
require('./application/components')(Application);
require('./application/models')(Application);
require('./application/controllers')(Application);

Application.fn.initialize = function(app_config) {
    this._id = helper.uid();
    this._alias = app_config.alias;

    this._ifnode_core_folder = __dirname;
    this._project_folder = app_config.project_folder || path.dirname(process.argv[1]);
    this._backend_folder = path.resolve(this._project_folder, 'protected/');

    _initialize_config.call(this, app_config.env || app_config.environment);
    _initialize_server.call(this);
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

    list_of_modules = this._modules = Array.isArray(this._modules)? this._modules.map(function(module) {
        return typeof module === 'string'? require_module(module) : module;
    }) : [];

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
Application.fn.run = function(callback) {
    this.load();
    _start_server.call(this, callback);
};

helper.define_properties(Application.fn, {
    'config': function() { return this._config },
    'server': function() { return this._server },

    'models':      function() { return this._models },
    'controllers': function() { return this._controllers },

    'id':    function() { return this._id },
    'alias': function() { return this._alias },
    'project_folder, projectFolder': function() { return this._project_folder },
    'backend_folder, backendFolder': function() { return this._backend_folder }
});

module.exports = Application;

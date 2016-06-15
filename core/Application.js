'use strict';

var _isPlainObject = require('lodash/isPlainObject');
var _includes = require('lodash/includes');
var toArray = require('./helper/toArray');
var defineProperties = require('./helper/defineProperties');

var debug = require('debug')('ifnode:application');
var FS = require('fs');
var Path = require('path');
var Express = require('express');
var UUID = require('node-uuid');
var Log = require('./extensions/log');

var Extension = require('./application/Extension');
var SchemaFactory = require('./SchemaFactory');
var Controller = require('./Controller');
var IFNodeVirtualSchema = require('./../plugins/ifnode-virtual');

/**
 * Creates a new Application instance
 *
 * @class Application
 * @param {Object} options
 */
function Application(options) {
    this._initialize(options || {});
}

require('./application/middleware')(Application);
require('./application/components')(Application);
require('./application/models')(Application);
require('./application/controllers')(Application);

/**
 * Require module from start point like application project folder
 *
 * @param {String} id
 * @returns {*}
 */
Application.prototype.require = function(id) {
    if(!(id in this._require_cache)) {
        this._require_cache[id] = require(Path.resolve(this.project_folder, id));
    }

    return this._require_cache[id];
};

/**
 * Registered plugin(s) for application instance
 *
 * @param {String|Extension|Array.<String|Extension>} plugin
 * @returns {Application}
 */
Application.prototype.register = function(plugin) {
    var type_of = typeof plugin;

    if(!(
        type_of === 'string' ||
        Array.isArray(plugin) ||
        (type_of !== 'undefined' && type_of !== 'number')
    )) {
        Log.error('plugins', 'Wrong plugin type');
    }

    this._modules = toArray(plugin);

    return this;
};

/**
 * Loads all maintenance parts of application
 *
 * @returns {Application}
 */
Application.prototype.load = function() {
    var app = this,

        initialize_models = function() {
            var type = 'schema',
                modules = app._modules,

                i,
                schema,
                module;

            for(i = 0; i < modules.length; ++i) {
                module = modules[i][type];

                if(module) {
                    schema = SchemaFactory();
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
            var require_module = function(module_name) {
                var module;

                try {
                    module = require(module_name);
                } catch(e) {
                    module = app.ext(module_name);
                }

                return module;
            };

            var modules = app._modules;

            modules = toArray(modules).map(function(module) {
                return typeof module === 'string'?
                    require_module(module) :
                    module;
            });

            modules.push(IFNodeVirtualSchema);

            app._modules = modules;
        };

    initialize_modules();
    initialize_models();
    initialize_components();
    initialize_controllers();

    this._is_loaded = true;

    return this;
};

/**
 * Start web-server
 *
 * @param {Function} callback
 */
Application.prototype.run = function(callback) {
    if(!this._is_loaded) {
        this.load();
    }

    var app_instance = this,
        local_config = this._config.site.local,
        server_params = [];

    if(local_config.port) {
        server_params.push(local_config.port);
    }
    if(!_includes(['127.0.0.1', 'localhost'], local_config.host)) {
        server_params.push(local_config.host);
    }
    if(typeof callback === 'function') {
        server_params.push(function() {
            callback.call(app_instance, app_instance.config);
        });
    }

    this._server.listen.apply(this._server, server_params);
};

/**
 * Stop web-server
 *
 * @param {Function} callback
 */
Application.prototype.down = function(callback) {
    this._server.close.call(this._server, callback);
};

/**
 *
 * @param {String} id
 * @returns {*}
 */
Application.prototype.extension = function(id) {
    var cache = this._extensions_cache;
    
    if(!(id in cache)) {
        var custom_folder = this.config.application.folders.extensions;
        var custom_full_path = Path.resolve(this._project_folder, custom_folder);
        var extension_loader = new Extension(custom_full_path);

        cache[id] = extension_loader.require(id);
    }

    return cache[id];
};
Application.prototype.ext = Application.prototype.extension;

/**
 * Initializes application instance
 *
 * @constructs Application
 * @param {Object} [app_config]
 * @param {String} [app_config.alias]
 * @param {String} [app_config.project_folder]
 * @param {String} [app_config.projectFolder]
 * @param {String} [app_config.environment]
 * @private
 */
Application.prototype._initialize = function(app_config) {
    if(app_config.alias && typeof app_config.alias !== 'string') {
        Log.error('application', 'Alias must be String');
    }

    this._require_cache = {};
    this._extensions_cache = {};

    this.id = UUID.v4();
    this.alias = app_config.alias || this.id;

    this._project_folder = app_config.project_folder || app_config.projectFolder || Path.dirname(process.argv[1]);
    this._backend_folder = Path.resolve(this._project_folder, 'protected/');

    this._initialize_config.call(this, app_config.env || app_config.environment);
    this._initialize_listener.call(this);
    this._initialize_server.call(this);
};

/**
 * Initialize application instance configuration
 *
 * @param {String} environment
 * @private
 */
Application.prototype._initialize_config = function(environment) {
    var config_path;

    if(environment) {
        config_path = Path.resolve(this._project_folder, 'config/', environment);
    }

    this._config = require('./config')({
        environment: environment,
        project_folder: this._project_folder,
        backend_folder: this._backend_folder,
        config_path: config_path
    });
};

/**
 * Initialize server listener
 *
 * @private
 */
Application.prototype._initialize_listener = function() {
    var app = Express(),
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
};

/**
 * Initialize native node.js http(s) server
 *
 * @private
 */
Application.prototype._initialize_server = function() {
    var server,
        credentials = this._config.site.local.ssl;

    if(_isPlainObject(credentials)) {
        if(credentials.pfx) {
            credentials = {
                pfx: FS.readFileSync(credentials.pfx, 'utf8')
            };
        } else if(credentials.key && credentials.cert) {
            credentials = {
                key: FS.readFileSync(credentials.key, 'utf8'),
                cert: FS.readFileSync(credentials.cert, 'utf8')
            };
        } else {
            Log.error('application', 'Wrong https credentials');
        }

        server = require('https').createServer(credentials, this._listener);
    } else {
        server = require('http').createServer(this._listener);
    }

    this._server = server;
};

defineProperties(Application.prototype, {
    'project_folder, projectFolder': function() { return this._project_folder; },
    'backend_folder, backendFolder': function() { return this._backend_folder; },

    'config': function() { return this._config; },
    'server': function() { return this._server; },
    'listener': function() { return this._listener; },

    'components':  function() { return this._components; },
    'models':      function() { return this._models; },
    'controllers': function() { return this._controllers; }
});

module.exports = Application;

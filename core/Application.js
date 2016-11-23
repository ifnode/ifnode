'use strict';

var Path = require('path');
var Util = require('util');
var Express = require('express');
var UUID = require('uuid');
var Diread = require('diread');

var toArray = require('./helper/toArray');
var defineProperties = require('./helper/defineProperties');

var debug = require('debug')('ifnode:application');
var Log = require('./extensions/log');

var Extension = require('./application/Extension');
var SchemaFactory = require('./SchemaFactory');
var ConfigurationBuilder = require('./ConfigurationBuilder');

var SchemasList = require('./application/SchemasList');
var DAOList = require('./application/DAOList');
var ModelBuilder = require('./application/ModelBuilder');

var Controller = require('./Controller');
var RestMiddleware = require('./middleware/rest');

var IFNodeVirtualSchema = require('./../plugins/ifnode-virtual');
var NodeHTTPServer = require('./../plugins/node-http_s-server');

/**
 * Creates a new Application instance
 *
 * @class
 *
 * @param {ApplicationOptions}  [options={}]
 */
function Application(options) {
    this._constructor(options || {});
}

require('./application/middleware')(Application);
require('./application/components')(Application);
require('./application/controllers')(Application);

/**
 * Require module from start point like application project folder
 *
 * @param   {string}    id
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
 * @param   {string|Extension|Array.<string|Extension>} plugin
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
    /**
     *
     * @param {Application} app
     */
    function initialize_modules(app) {
        var modules = app._modules;

        modules = toArray(modules).map(function(module) {
            return typeof module === 'string'?
                app._require_module(module) :
                module;
        });

        modules.push(IFNodeVirtualSchema);

        app._modules = modules;
    }

    /**
     *
     * @param {Application} app
     */
    function initialize_models(app) {
        var db = app.config.db;

        if(!(db && Object.keys(db).length)) {
            return;
        }

        var type = 'schema';
        var modules = app._modules;
        var schemas_list = new SchemasList;

        for(var i = 0; i < modules.length; ++i) {
            var module = modules[i][type];

            if(module) {
                var schema = SchemaFactory();

                module(app, schema);
                schemas_list.attach_schema(schema);
            }
        }

        app._models_builder = new ModelBuilder(
            new DAOList(schemas_list, db)
        );

        Diread({
            src: app.config.application.folders.models
        }).each(function(model_file_path) {
            require(model_file_path);
        });

        app.models = app._models_builder.compile_models();
        
        Object.freeze(app.models);
    }

    /**
     *
     * @param {Application} app
     */
    function initialize_components(app) {
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
    }

    /**
     *
     * @param {Application} app
     */
    function initialize_controllers(app) {
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
    }

    initialize_modules(this);
    initialize_models(this);
    initialize_components(this);
    initialize_controllers(this);

    this._is_loaded = true;

    return this;
};

/**
 *
 * @param   {string}    id
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
 *
 * @param   {Object}    model_config
 * @param   {Object}    options
 * @returns {Function}
 * @constructor
 */
Application.prototype.Model = function(model_config, options) {
    return this._models_builder.make(model_config, options);
};

/**
 * Start web-server
 *
 * @param {function}    callback
 */
Application.prototype.run = Util.deprecate(function(callback) {
    if(!this._is_loaded) {
        this.load();
    }

    var self = this;
    var connection = this.connection;

    if(typeof callback === 'function') {
        connection.listen(function() {
            callback.call(self, self.config);
        });
    } else {
        connection.listen();
    }
}, 'Deprecated from 2.0.0 version. Server will started by app.connection.listen()');

/**
 * Stop web-server
 *
 * @param {function}    callback
 */
Application.prototype.down = Util.deprecate(function(callback) {
    this.connection.close(callback);
}, 'Deprecated from 2.0.0 version. Server will be stopped by app.connection.close()');

/**
 * Initializes application instance
 *
 * @param {ApplicationOptions}  [app_config]
 * @private
 */
Application.prototype._constructor = function(app_config) {
    if(app_config.alias && typeof app_config.alias !== 'string') {
        Log.error('application', 'Alias must be String');
    }

    this.id = UUID.v4();
    this.alias = app_config.alias || this.id;

    this._require_cache = {};
    this._extensions_cache = {};
    this._project_folder = app_config.project_folder || app_config.projectFolder || Path.dirname(process.argv[1]);
    this._backend_folder = Path.resolve(this._project_folder, 'protected/');

    this._models_builder = null;

    this._initialize_config(app_config.env || app_config.environment);

    this.listener = this._initialize_listener();

    this.connection = this._initialize_connection_server();
    this.server = this.connection.server;
};

/**
 * Initialize application instance configuration
 *
 * @param {string}  environment
 * @private
 */
Application.prototype._initialize_config = function(environment) {
    var config_path;

    if(environment) {
        config_path = Path.resolve(this._project_folder, 'config/', environment);
    }

    this.config = ConfigurationBuilder({
        environment: environment,
        project_folder: this._project_folder,
        backend_folder: this._backend_folder,
        config_path: config_path
    });
};

/**
 * Initialize server listener
 *
 * @returns {Express}
 * @private
 */
Application.prototype._initialize_listener = function() {
    var app = Express();
    var config = this.config;
    var app_config = config.application;

    var middleware_configs = app_config.middleware;

    app.use(RestMiddleware.response());
    if(middleware_configs) {
        this._initialize_middleware(middleware_configs, app);
        app.use(RestMiddleware.request());
    }

    var express_configs = app_config.express;

    Object.keys(express_configs).forEach(function(express_option) {
        app.set(express_option, express_configs[express_option]);
    });

    return app;
};

/**
 * Initialize native node.js (http,https, etc) server
 *
 * @returns {IConnectionServer}
 * @private
 */
Application.prototype._initialize_connection_server = function() {
    var site_config = this.config.site;
    var connection = site_config.connection;

    switch(connection) {
        case 'http':
        case 'https':
            return new NodeHTTPServer(this.listener, site_config);
        default:
            /**
             *
             * @class IConnectionServer
             */
            var ServerCreator = this._require_module(connection);

            return new ServerCreator(this.listener, site_config);
    }
};

/**
 * Require node_module or application extension
 *
 * @returns {*}
 * @private
 */
Application.prototype._require_module = function(module_name) {
    var Module;

    try {
        Module = require(module_name);
    } catch(e) {
        Module = this.extension(module_name);
    }

    return Module;
};

defineProperties(Application.prototype, {
    'project_folder, projectFolder': function() { return this._project_folder; },
    'backend_folder, backendFolder': function() { return this._backend_folder; },

    'components':  function() { return this._components || {}; },
    'controllers': function() { return this._controllers || {}; }
});

module.exports = Application;

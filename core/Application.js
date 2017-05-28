'use strict';

var Path = require('path');
var Util = require('util');
var Express = require('express');
var UUID = require('uuid');
var Diread = require('diread');

var toArray = require('./helper/toArray');
var deepFreeze = require('./helper/deepFreeze');
var pathWithoutExtension = require('./helper/pathWithoutExtension');
var tryCatch = require('./helper/tryCatch');

var debug = require('debug')('ifnode:application');
var Log = require('./Log');

var Extension = require('./application/Extension');
var PLUGIN_TYPES = require('./PLUGIN_TYPES');
var SchemaFactory = require('./SchemaFactory');
var ConfigurationBuilder = require('./ConfigurationBuilder');

var SchemasList = require('./application/SchemasList');
var DAOList = require('./application/DAOList');
var ModelBuilder = require('./application/ModelBuilder');

var ComponentsBuilder = require('./application/ComponentsBuilder');
var ControllersBuilder = require('./application/ControllersBuilder');

var Controller = require('./Controller');
var RestMiddleware = require('./middleware/rest');

var IFNodeVirtualSchema = require('./../plugins/ifnode-virtual');
var NodeHTTPServer = require('./../plugins/node-http_s-server');

/**
 * Creates a new Application instance
 *
 * @class Application
 *
 * @param {ApplicationOptions}  options
 */
function Application(options) {
    if(options.alias && typeof options.alias !== 'string') {
        Log.error('application', 'Alias must be String');
    }

    this._require_cache = {};
    this._extensions_cache = {};
    this._project_folder = options.project_folder || options.projectFolder || Path.dirname(process.argv[1]);
    this._backend_folder = Path.resolve(this._project_folder, 'protected/');

    this._modules = [
        IFNodeVirtualSchema
    ];
    this._models_builder = null;
    this._components_builder = null;
    this._controllers_builder = null;

    this.id = UUID.v4();
    this.alias = options.alias || this.id;
    this.project_folder = this.projectFolder = this._project_folder;
    this.backend_folder = this.backendFolder = this._backend_folder;

    this.config = this._initialize_config(options.env || options.environment);
    deepFreeze(this.config);
    
    this.listener = this._initialize_listener();
    this.connection = this._initialize_connection_server();

    /**
     * @deprecated      Deprecated from 2.0.0 version. Connection server will be presented by app.connection
     * @type {http.Server}
     */
    this.server = this.connection.server;

    this.models = {};
    this.components = {};
    this.controllers = {};
}

require('./application/middleware')(Application);

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
 * @param   {string|Extension|Array.<string|Extension>} module
 * @returns {Application}
 */
Application.prototype.register = function(module) {
    var type_of = typeof module;

    if(!(
        type_of === 'string' ||
        Array.isArray(module) ||
        (type_of !== 'undefined' && type_of !== 'number')
    )) {
        Log.error('plugins', 'Wrong plugin type');
    }

    var self = this;
    var modules = this._modules;

    toArray(module).forEach(function(module) {
        modules.push(typeof module === 'string' ?
            self._require_module(module) :
            module
        );
    });

    return this;
};

/**
 * Loads all maintenance parts of application
 *
 * @returns {Application}
 */
Application.prototype.load = function() {
    this.models = this._initialize_models();
    Object.freeze(this.models);

    this.components = this._initialize_components();
    // Object.freeze(this.components);

    this.controllers = this._initialize_controllers();
    Object.freeze(this.controllers);

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

/**
 *
 * @param   {string}    id
 * @returns {*}
 */
Application.prototype.ext = Util.deprecate(
    Application.prototype.extension,
    'Deprecated from 2.0.0 version. Needs to use app.extension() method'
);

/**
 *
 * @param   {string}    id
 * @returns {Object}
 */
Application.prototype.component = function(id) {
    if(id in this.components) {
        return this.components[id];
    }

    var full_path = Path.resolve(this.config.application.folders.components, id);

    if(!(full_path in this.components)) {
        this.components[full_path] = this._components_builder.read_and_build_component(full_path, {
            name: id
        });
    }

    return this.components[full_path];
};

/**
 *
 * @param   {Object}    model_config
 * @param   {Object}    [options]
 * @returns {Function}
 * @constructor
 */
Application.prototype.Model = function(model_config, options) {
    return this._models_builder.make(model_config, options);
};

/**
 *
 * @param   {Object}    [custom_component_config]
 * @returns {Component}
 */
Application.prototype.Component = function(custom_component_config) {
    var builder = this._components_builder;

    return builder.make(
        builder.build_component_config(custom_component_config || {}, this.config.components)
    );
};

/**
 *
 * @param   {Object}    controller_config
 * @returns {Controller}
 */
Application.prototype.Controller = function(controller_config) {
    return this._controllers_builder.make(controller_config);
};

/**
 * Start web-server
 *
 * @deprecated
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
 * @deprecated
 * @param {function}    callback
 */
Application.prototype.down = Util.deprecate(function(callback) {
    this.connection.close(callback);
}, 'Deprecated from 2.0.0 version. Server will be stopped by app.connection.close()');

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

    return ConfigurationBuilder({
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
 *
 * @private
 */
Application.prototype._initialize_models = function _initialize_models() {
    var db = this.config.db;

    if(!(db && Object.keys(db).length)) {
        return;
    }

    var modules = this._modules;
    var schemas_list = new SchemasList;

    for(var i = 0; i < modules.length; ++i) {
        var module = modules[i][PLUGIN_TYPES.SCHEMA];

        if(module) {
            var schema = SchemaFactory();

            module(this, schema);
            schemas_list.attach_schema(schema);
        }
    }

    var models_builder = this._models_builder = new ModelBuilder(
        new DAOList(schemas_list, db)
    );

    Diread({
        src: this.config.application.folders.models
    }).each(function(model_file_path) {
        require(model_file_path);
    });

    return models_builder.compile_models(this);
};

/**
 *
 * @returns {Object.<string, Component>}
 * @private
 */
Application.prototype._initialize_components = function _initialize_components()  {
    var components_builder = this._components_builder = new ComponentsBuilder;
    var Component = this.Component.bind(this);
    var modules = this._modules;

    for(var i = 0; i < modules.length; ++i) {
        var module = modules[i][PLUGIN_TYPES.COMPONENT];

        if(module) {
            module(this, Component);
        }
    }

    var components_config = this.config.components;

    Diread({
        src: this.config.application.folders.components,
        directories: true,
        level: 1,
        mask: function(path) {
            return path === pathWithoutExtension(path) ||
                path.indexOf('.js') !== -1;
        }
    }).each(function(component_path) {
        var autoformed_config = components_builder.build_and_memorize_config(component_path);

        try {
            components_builder.read_and_build_component(
                component_path,
                components_builder.build_component_config({}, components_config)
            );
        } catch(error) {
            /**
             * Errors inside component will not catch by this handle
             */
            if(error.message.indexOf(component_path) === -1) {
                throw error;
            } else {
                Log.warning(
                    'components',
                    'Cannot load component [' + autoformed_config.name + '] by path [' + component_path + ']'
                );
            }
        }
    });

    return components_builder.compile(this);
};

/**
 *
 * @private
 */
Application.prototype._initialize_controllers = function _initialize_controllers() {
    var controllers_builder = this._controllers_builder = new ControllersBuilder();
    var modules = this._modules;

    for(var i = 0; i < modules.length; ++i) {
        var module = modules[i][PLUGIN_TYPES.CONTROLLER];

        if(module) {
            module(this, Controller);
        }
    }

    controllers_builder.read_and_initialize_controllers(
        this.config.application.folders.controllers, this
    );

    return controllers_builder.compile(this.listener);
};

/**
 * Require node_module or application extension
 *
 * @returns {*}
 * @private
 */
Application.prototype._require_module = function(module_name) {
    var Module;

    Module = tryCatch(function() {
        return require(module_name);
    });

    if(Module) {
        return Module;
    }

    var self = this;

    Module = tryCatch(function() {
        return self.extension(module_name);
    });

    if(Module) {
        return Module;
    }

    Log.error('application', 'Cannot find node module or extension [' + module_name + '].');
};

module.exports = Application;

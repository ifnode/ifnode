var path = require('path'),
    fn = require('./libs/fns');

var Application = function() {
    this._project_folder = process.cwd();
    this._environment = 'development';
    this._debug = false;
    this._config;
    this._server;
    this.init.apply(this, arguments);
};
Application.fn = Application.prototype;

Application.fn._init_config = function() {
    var config_path = path.join(this._project_folder, 'configs', this._environment);

    this._config = require(config_path);

    // TODO: populate our config by raw config
    // Get default pattern of config
    // Check default and current configs
    // Exchange default settings if not added, throws exception if have error and wrong if some not added
};
Application.fn._init_models = function() {
    global.Model = require('./model');

    var fs = require('fs'),
        path_to_models = path.join(PROJECT_FOLDER, config.folders.backend, config.folders.models),
        models_paths = fs.readdirSync(path_to_models);

    models_paths.forEach(function(file_name) {
        global.Model._current_inited_file = path.basename(file_name, '.js');
        require( path.join(path_to_models, file_name) );
    });
    delete global.Model._current_inited_file;
};
Application.fn._init_controllers = function() {
    var Controller = require('./controller');
    var fs = require('fs');

    var config = this._config,
        path_to_controllers = path.join(this._project_folder, config.folders.backend, config.folders.controllers),
        controllers_paths = fs.readdirSync(path_to_controllers);

    controllers_paths.forEach(function(file_name) {
        Controller.
        Controller._current_inited_file = path.basename(file_name, '.js');
        require( path.join(path_to_controllers, file_name) );
    });
    delete Controller._current_inited_file;
};
Application.fn._init_server = function() {
    var middleware = require('./middleware');
    var express = require('express');
    app = express();

    app.set('ip', config.application.ip);
    app.set('port', config.application.port);
//    app.set('views', path.join(PROJECT_FOLDER, config.folders.backend, config.folders.views));
    app.set('view engine', config.engine.view);

//    app.use(express.static(path.join(PROJECT_FOLDER, config.folders.frontend)));

    // TODO: what and why
//    app.use(express.favicon());
//    app.use(express.logger('dev'));
//    app.use(express.bodyParser());
//    app.use(express.methodOverride());
//
//    // TODO: session
//    app.use(express.cookieParser());
//    app.use(express.session({ secret: 'keyboard cat' }));
//
//    app.use(express.errorHandler());

    app.use(middleware.extended_response());
};
Application.fn._start_server = function(/* callbacks */) {
    var callbacks = [].slice.call(arguments),
        site_config = this._config.site;

    this._server.listen.apply(this._server, [site_config.port, site_config.ip].concat(callbacks));
};

Application.fn.configurantion = Application.fn.conf = function(conf) {
    for(var key in conf) {
        this[key] = conf[key];
    }
    return this;
};
Application.fn.run = function() {
    this._init_config();
//    init_models();
    this._init_controllers();

    this._init_server();
    this._start_server.apply(this, arguments);
};

Application.fn.init = function(configuration) {
    this.conf(configuration);
};

Application.fn.__defineGetter__('server', function() { return app; });
Application.fn.__defineGetter__('config', function() { return config; });

Application.fn.__defineGetter__('models');
Application.fn.__defineGetter__('controllers');
Application.fn.__defineGetter__('components');

module.exports = function(configuration) {
    return new Application(configuration);
}
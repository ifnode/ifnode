var path = require('path'),
    diread = require('diread'),

    helper = require('./../helper'),
    Controller = require('./../controller');

module.exports = function(Application) {
    Application.fn._initialize_controllers = function() {
        var controllers_folder = this.config.application.folders.controllers;

        diread({
            src: path.resolve(this._project_folder, controllers_folder)
        }).each(function(controller_file_path) {
            require(controller_file_path);
        });
    };
    Application.fn._compile_controllers = function() {
        var app_controllers = this._controllers,
            app_server = this._server;

        Object.keys(app_controllers).forEach(function(controller_id) {
            var controller = app_controllers[controller_id];

            app_server.use(controller.root, controller.router);
        });
    };
    Application.fn._init_controllers = function() {
        this._controllers = {};
        this._initialize_controllers();
        this._compile_controllers();
    };
    Application.fn.Controller = function(controller_config) {
        var controller = Controller(controller_config);

        this._controllers[controller.name] = controller;

        return controller;
    };
};

var Path = require('path');
var Diread = require('diread');
var Controller = require('./../Controller');

module.exports = function(Application) {
    Application.prototype._initialize_controllers = function() {
        var controllers_folder = this.config.application.folders.controllers;

        Diread({
            src: Path.resolve(this._project_folder, controllers_folder)
        }).each(function(controller_file_path) {
            require(controller_file_path);
        });
    };
    Application.prototype._compile_controllers = function() {
        var app_controllers = this._controllers,
            app_server = this.server;

        Object.keys(app_controllers).forEach(function(controller_id) {
            var controller = app_controllers[controller_id];

            app_server.use(controller.root, controller.router);
        });
    };
    Application.prototype._init_controllers = function() {
        this._controllers = {};
        this._initialize_controllers();
        this._compile_controllers();
    };
    Application.prototype.Controller = function(controller_config) {
        var controller = Controller(controller_config);

        this._controllers[controller.name] = controller;

        return controller;
    };
};

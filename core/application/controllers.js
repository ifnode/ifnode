'use strict';

var _defaults = require('lodash/defaults');
var _last = require('lodash/last');

var pathWithoutExtension = require('./../helper/pathWithoutExtension');
var addSlashToStringEnd = require('./../helper/addSlashToStringEnd');

var debug = require('debug')('ifnode:controllers');
var FS = require('fs');
var Path = require('path');
var Log = require('./../extensions/log');
var Controller = require('./../Controller');

module.exports = function(Application) {
    var autoformed_controller_config;

    Application.prototype._initialize_controllers = function() {
        var self = this,
            controllers_path = this.config.application.folders.controllers,
            first_loaded_file = '!',
            last_loaded_file = '~',

            cut_start_slash = function(str) {
                var first_letter = str[0];

                if(first_letter === '/' || first_letter === '\\') {
                    str = str.substring(1);
                }

                return str;
            },
            read_controllers = function(main_folder, callback) {
                var regularize = function(directory_path, list) {
                        var is_directory = function(file_name) {
                                var file_path = Path.resolve(directory_path, file_name);

                                return FS.statSync(file_path).isDirectory();
                            },
                            regularized = {
                                start: false,
                                directories: [],
                                files: [],
                                end: false
                            };

                        list.forEach(function(file_name) {
                            if(is_directory(file_name)) {
                                regularized.directories.push(file_name);
                            } else if(first_loaded_file === pathWithoutExtension(Path.basename(file_name))) {
                                regularized.start = file_name;
                            } else if(last_loaded_file === pathWithoutExtension(Path.basename(file_name))) {
                                regularized.end = file_name;
                            } else {
                                regularized.files.push(file_name);
                            }
                        });

                        return regularized;
                    },

                    read_file = function(full_file_path) {
                        var relavite_path = full_file_path.replace(main_folder, '');

                        callback(full_file_path, relavite_path);
                    },

                    read_directory = function(dir_path) {
                        var files = FS.readdirSync(dir_path),
                            read_parts = regularize(dir_path, files.filter(function(filename) {
                                return filename.indexOf('DS_Store') === -1;
                            }));

                        if(read_parts.start) {
                            read_file(Path.resolve(dir_path, read_parts.start));
                        }

                        read_parts.directories.forEach(function(directory_name) {
                            read_directory(Path.resolve(dir_path, directory_name));
                        });

                        read_parts.files.forEach(function(file_name) {
                            read_file(Path.resolve(dir_path, file_name));
                        });

                        if(read_parts.end) {
                            read_file(Path.resolve(dir_path, read_parts.end));
                        }
                    };

                read_directory(main_folder);
            };

        if(FS.existsSync(controllers_path)) {
            read_controllers(controllers_path, function(controller_file_path, relative_path) {
                var path_without_extension = pathWithoutExtension(relative_path),
                    root = path_without_extension
                        .replace(first_loaded_file, '')
                        .replace(last_loaded_file, '')
                        .replace(/\\/g, '/'),
                    name = cut_start_slash(path_without_extension),
                    config = {},

                    controller;

                if(name !== '') {
                    config.name = name;
                }
                if(root !== '') {
                    config.root = addSlashToStringEnd(root);
                }

                autoformed_controller_config = config;

                require(controller_file_path);

                controller = self._controllers[autoformed_controller_config.name];

                if(controller) {
                    controller._compile();
                }
            });
        }
    };
    Application.prototype._compile_controllers = function() {
        var app = this.listener,
            app_controllers = this._controllers,
            app_controllers_ids = Object.keys(app_controllers),

            last_controller;

        if(!app_controllers_ids.length) {
            return;
        }

        last_controller = app_controllers[_last(app_controllers_ids)];
        app_controllers_ids.forEach(function(controller_id) {
            var controller = app_controllers[controller_id];

            app.use(controller.root, controller.router);
        });

        app.use(function(err, request, response, next) {
            if(typeof last_controller.error_handler !== 'function') {
                Log.error('controllers', err);
            }

            last_controller.error_handler.apply(last_controller, arguments);
        });
    };
    Application.prototype._init_controllers = function() {
        this._controllers = {};
        this._initialize_controllers();
        this._compile_controllers();
    };

    Application.prototype.Controller = function(controller_config) {
        var config = _defaults(controller_config || {}, autoformed_controller_config),
            controller = Controller(config);

        if(controller.name in this._controllers) {
            Log.error('controllers', 'Controller with name [' + controller.name + '] already set.');
        }

        autoformed_controller_config = config;

        this._controllers[controller.name] = controller;

        return controller;
    };
};

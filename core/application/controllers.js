var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),

    helper = require('./../helper'),
    Controller = require('./../controller');

module.exports = function(Application) {
    Application.fn._initialize_controllers = function() {
        var self = this,

            controllers_folder = this.config.application.folders.controllers,
            controllers_full_path = path.resolve(this._project_folder, controllers_folder),
            first_loaded_file = '!',
            last_loaded_file = '~',

            without_extension = function(path) {
                return path.split('.')[0];
            },
            read_controllers = function(main_folder, callback) {
                var regularize = function(directory_path, list) {
                        var is_directory = function(file_name) {
                                var file_path = path.join(directory_path, file_name);

                                return fs.statSync(file_path).isDirectory();
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
                            } else if(first_loaded_file === without_extension(path.basename(file_name))) {
                                regularized.start = file_name;
                            } else if(last_loaded_file === without_extension(path.basename(file_name))) {
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
                        var files = fs.readdirSync(dir_path),
                            read_parts = regularize(dir_path, files);

                        if(read_parts.start) {
                            read_file(path.join(dir_path, read_parts.start));
                        }

                        read_parts.directories.forEach(function(directory_name) {
                            read_directory(path.join(dir_path, directory_name));
                        });

                        read_parts.files.forEach(function(file_name) {
                            read_file(path.join(dir_path, file_name));
                        });

                        if(read_parts.end) {
                            read_file(path.join(dir_path, read_parts.end));
                        }
                    };

                read_directory(main_folder);
            };

        this._autoformed_controller_config = {};

        if(fs.existsSync(controllers_full_path)) {
            read_controllers(controllers_full_path, function(controller_file_path, relative_path) {
                var root = without_extension(relative_path)
                        .replace(first_loaded_file, '')
                        .replace(last_loaded_file, '')
                        .replace(/\\/g, '/'),
                    name = path.basename(root),

                    config = {};

                if(name !== '') {
                    config.name = name;
                }
                if(root !== '') {
                    if(root[root.length - 1] !== '/') {
                        root += '/';
                    }
                    config.root = root;
                }

                self._autoformed_controller_config = config;

                require(controller_file_path);
            });
        }
    };
    Application.fn._compile_controllers = function() {
        var app_controllers = this._controllers,
            app_controllers_ids = Object.keys(app_controllers),
            app_server = this._server,

            last_controller;

        if(!app_controllers_ids.length) {
            return;
        }

        last_controller = app_controllers[_.last(app_controllers_ids)];
        app_controllers_ids.forEach(function(controller_id) {
            var controller = app_controllers[controller_id];

            app_server.use(controller.root, controller.router);
        });

        app_server.use(last_controller.error_handler.bind(app_server));
    };
    Application.fn._init_controllers = function() {
        this._controllers = {};
        this._initialize_controllers();
        this._compile_controllers();
    };

    Application.fn.Controller = function(controller_config) {
        if(!_.isPlainObject(controller_config)) {
            controller_config = {}
        }

        var autoformed_controller_config = this._autoformed_controller_config,
            config = _.defaults(controller_config, autoformed_controller_config),
            controller = Controller(config);

        if(controller.name in this._controllers) {
            throw new Error('[ifnode] [controller] Controller with name "' + controller.name + '" already set.');
        }

        this._controllers[controller.name] = controller;

        return controller;
    };
};

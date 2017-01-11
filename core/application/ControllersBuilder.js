'use strict';

var _defaults = require('lodash/defaults');
var _last = require('lodash/last');
var FS = require('fs');
var Path = require('path');

var debug = require('debug')('ifnode:controllers');
var pathWithoutExtension = require('./../helper/pathWithoutExtension');
var addSlashToStringEnd = require('./../helper/addSlashToStringEnd');
var Log = require('./../extensions/log');
var Controller = require('./../Controller');

/**
 *
 * @param   {string}    string
 * @returns {string}
 */
function cut_start_slash(string) {
    var first_letter = string[0];

    if(first_letter === '/' || first_letter === '\\') {
        string = string.substring(1);
    }

    return string;
}

/**
 *
 * @param   {string}    root_path
 * @param   {string}    rest_path
 * @returns {boolean}
 */
function is_directory(root_path, rest_path) {
    return FS
        .statSync(Path.resolve(root_path, rest_path))
        .isDirectory();
}

/**
 *
 * @class ControllersBuilder
 */
function ControllersBuilder() {
    this._controllers = {};
    this._autoformed_config = null;
}

ControllersBuilder.FIRST_LOADED_FILE = '!';
ControllersBuilder.LAST_LOADED_FILE = '~';

/**
 *
 * @param   controller_config
 * @returns {Controller}
 */
ControllersBuilder.prototype.make = function(controller_config) {
    var config = _defaults(controller_config || {}, this._autoformed_config);
    var controller = new Controller(config);

    if(controller.name in this._controllers) {
        Log.error('controllers', 'Controller with name [' + controller.name + '] already set.');
    }

    this._autoformed_config = config;
    this._controllers[controller.name] = controller;

    return controller;
};

/**
 *
 * @param   {Express}   listener
 * @returns {Object.<string, Controller>}
 */
ControllersBuilder.prototype.compile = function(listener) {
    var controllers = this._controllers;
    var controllers_ids = Object.keys(controllers);

    if(!controllers_ids.length) {
        return {};
    }

    var last_controller = controllers[_last(controllers_ids)];

    controllers_ids.forEach(function(controller_id) {
        var controller = controllers[controller_id];

        listener.use(controller.root, controller.router);
    });

    listener.use(function(err, request, response, next) {
        if(typeof last_controller.error_handler !== 'function') {
            Log.error('controllers', err);
        }

        last_controller.error_handler.apply(last_controller, arguments);
    });

    return this._controllers;
};

/**
 *
 * @param {string}      controllers_path
 * @param {Application} app
 */
ControllersBuilder.prototype.read_and_initialize_controllers = function read_and_initialize_controllers(controllers_path, app) {
    if(!FS.existsSync(controllers_path)) {
        return;
    }

    var self = this;
    var Class = this.constructor;
    var FIRST_LOADED_FILE = Class.FIRST_LOADED_FILE;
    var LAST_LOADED_FILE = Class.LAST_LOADED_FILE;

    this._read_controllers(controllers_path, function(controller_file_path, relative_path) {
        var path_without_extension = pathWithoutExtension(relative_path);
        var root = path_without_extension
            .replace(FIRST_LOADED_FILE, '')
            .replace(LAST_LOADED_FILE, '')
            .replace(/\\/g, '/');
        var name = cut_start_slash(path_without_extension);
        var config = {};

        if(name !== '') {
            config.name = name;
        }
        if(root !== '') {
            config.root = addSlashToStringEnd(root);
        }

        self._autoformed_config = config;

        require(controller_file_path);

        var controller = self._controllers[self._autoformed_config.name];

        if(controller) {
            app.controllers[controller.name] = controller;
            controller.compile();
        }
    });
};

/**
 *
 * @param {string}      main_folder
 * @param {function}    finder
 * @private
 */
ControllersBuilder.prototype._read_controllers = function _read_controllers(main_folder, finder) {
    var Class = this.constructor;
    var FIRST_LOADED_FILE = Class.FIRST_LOADED_FILE;
    var LAST_LOADED_FILE = Class.LAST_LOADED_FILE;

    /**
     *
     * @param   {string}            directory_path
     * @param   {Array.<string>}    list
     * @returns {{
     *     start: boolean,
     *     directories: Array.<string>,
     *     files: Array.<string>,
     *     end: boolean
     * }}
     */
    function inspect_directory(directory_path, list) {
        var regularized = {
            start: false,
            directories: [],
            files: [],
            end: false
        };

        list.forEach(function(file_name) {
            if(is_directory(directory_path, file_name)) {
                regularized.directories.push(file_name);
            } else if(FIRST_LOADED_FILE === pathWithoutExtension(Path.basename(file_name))) {
                regularized.start = file_name;
            } else if(LAST_LOADED_FILE === pathWithoutExtension(Path.basename(file_name))) {
                regularized.end = file_name;
            } else {
                regularized.files.push(file_name);
            }
        });

        return regularized;
    }

    /**
     *
     * @param {string}      root_path
     * @param {string}      full_file_path
     * @param {function}    finder
     */
    function read_file(root_path, full_file_path, finder) {
        finder(full_file_path, full_file_path.replace(root_path, ''));
    }

    /**
     *
     * @param {string}      root_path
     * @param {string}      directory_path
     * @param {function}    finder
     */
    function inspect_directories(root_path, directory_path, finder) {
        var files = FS.readdirSync(directory_path);
        var read_parts = inspect_directory(directory_path, files.filter(function(filename) {
            return filename.indexOf('DS_Store') === -1;
        }));

        if(read_parts.start) {
            read_file(root_path, Path.resolve(directory_path, read_parts.start), finder);
        }

        read_parts.directories.forEach(function(directory_name) {
            inspect_directories(root_path, Path.resolve(directory_path, directory_name), finder);
        });

        read_parts.files.forEach(function(file_name) {
            read_file(root_path, Path.resolve(directory_path, file_name), finder);
        });

        if(read_parts.end) {
            read_file(root_path, Path.resolve(directory_path, read_parts.end), finder);
        }
    }

    inspect_directories(main_folder, main_folder, finder);
};

module.exports = ControllersBuilder;

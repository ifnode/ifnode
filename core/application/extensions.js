'use strict';

var path = require('path'),
    log = require('./../extensions/log');

module.exports = function(Application) {
    Application.fn.extension = Application.fn.ext = Application.fn.require = function(name) {
        var custom_folder = this.config.application.folders.extensions,
            custom_full_path = path.resolve(this._project_folder, custom_folder);

        try {
            return require(path.resolve(custom_full_path, name));
        } catch(err) {
            log.error('extensions', 'Cannot find extension by [' + name + '].');
        }
    };
};

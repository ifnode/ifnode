var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),

    log = require('./../extensions/log');

module.exports = function(Application) {
    Application.fn._initialize_extensions = function() {
        var read = function(extension_folder) {
                var to_name = function(filename) {
                    var extension_name = filename.split('.')[0];

                    return [extension_name, path.resolve(extension_folder, filename)];
                };

                try {
                    return fs.readdirSync(extension_folder).map(to_name);
                } catch(error) {
                    return [];
                }
            },

            custom_folder = this.config.application.folders.extensions,
            custom_full_path = path.resolve(this._project_folder, custom_folder),
            custom_extensions = read(custom_full_path);

        this._extensions = _.object(custom_extensions);
    };

    Application.fn.extension = Application.fn.ext = Application.fn.require = function(name) {
        if(!(name in this._extensions)) {
            log.error('extensions', 'Cannot find extension with name [' + name + '].');
        }

        return require(this._extensions[name]);
    };
};

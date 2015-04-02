var fs = require('fs'),
    path = require('path'),
    _ = require('lodash');

module.exports = function(Application) {
    Application.fn._initialize_extensions = function() {
        var custom_folder = this.config.application.folders.extensions,

            core_path = path.resolve(this._ifnode_core_folder, 'extensions/'),
            custom_path = path.resolve(this._project_folder, custom_folder),

            read = function(extension_folder, for_check) {
                var to_name = function(filename) {
                    var extension_name = filename.split('.')[0];

                    if(_.contains(for_check, extension_name)) {
                        console.warn('[ifnode] [extensions] Redefine core extension "' + extension_name + '"');
                    }

                    return [extension_name, path.resolve(extension_folder, filename)];
                };

                try {
                    return fs.readdirSync(extension_folder).map(to_name);
                } catch(error) {
                    return [];
                }
            },

            core_extensions,
            custom_extensions;

        core_extensions = read(core_path, []);
        custom_extensions = read(custom_path, _.map(core_extensions, function(item) { return item[0] }));

        this._extensions = _.object(core_extensions.concat(custom_extensions));
    };

    Application.fn.extension = Application.fn.ext = Application.fn.require = function(name) {
        if(name in this._extensions) {
            return require(this._extensions[name]);
        }

        throw new Error('[ifnode] [extensions] Cannot find extension with name "' + name + '"');
    };
};

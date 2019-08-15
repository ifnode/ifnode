'use strict';

var Path = require('path');
var requireWithSkippingOfMissedModuleError = require('./../helper/requireWithSkippingOfMissedModuleError');
var Log = require('./../Log');

/**
 *
 * @class Extension
 * @param {String} start_load_point
 */
function Extension(start_load_point) {
    this._start_load_point = start_load_point;
}

/**
 * Required module from start load point
 *
 * @param {String} id
 * @returns {*}
 */
Extension.prototype.require = function(id) {
    var extension_path = Path.resolve(this._start_load_point, id);
    var extension = requireWithSkippingOfMissedModuleError(extension_path);

    if(!extension) {
        Log.error('extensions', 'Cannot find extension by [' + id + '].');
    }

    return extension;
};

module.exports = Extension;

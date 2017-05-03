'use strict';

var Path = require('path');
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

    try {
        return require(extension_path);
    } catch(error) {
        if(error.message.indexOf(extension_path) === -1) {
            throw error;
        } else {
            Log.error('extensions', 'Cannot find extension by [' + id + '].');
        }
    }
};

module.exports = Extension;

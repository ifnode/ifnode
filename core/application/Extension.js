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
    try {
        return require(Path.resolve(this._start_load_point, id));
    } catch(err) {
        Log.error('extensions', 'Cannot find extension by [' + id + '].');
    }
};

module.exports = Extension;

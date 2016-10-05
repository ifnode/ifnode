'use strict';

var Debug = require('debug');
var sprintf = require('sprintf').sprintf;
var toArray = require('./../helper/toArray');

/**
 *
 * @class Log
 *
 * @param   {*} args
 * @returns {Log}
 * @constructor
 */
function Log(args) {
    var callee = Log;

    callee.log.apply(callee, ['common'].concat(toArray(arguments)));
}

Log.DEBUG_KEY = 'ifnode:';
Log.TEMPLATE = '[ifnode] [%s] %s';

/**
 *
 * @param {string}  key
 * @param {*}       args
 */
Log.log = function(key, args) {
    var debug = Debug(this.DEBUG_KEY + key);

    debug.apply(debug, toArray(arguments, 1));
};

/**
 *
 * @param   {*} args
 * @returns {*}
 */
Log.form = function(args) {
    args = [].slice.call(arguments);

    return sprintf.apply(sprintf, args);
};

/**
 *
 * @param {string}          name
 * @param {Error|string}    warning
 */
Log.warning = function(name, warning) {
    if(warning instanceof Error) {
        warning = warning.message;
    }

    this.log('warning', this.form(this.TEMPLATE, name, warning));
};

/**
 *
 * @param {string}          name
 * @param {Error|string}    error
 */
Log.error = function(name, error) {
    if(!(error instanceof Error)) {
        error = new Error(this.form(this.TEMPLATE, name, error));
    }

    throw error;
};

module.exports = Log;

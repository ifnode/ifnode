'use strict';

var Debug = require('debug');
var toArray = require('./helper/toArray');

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
Log.TEMPLATE = '[ifnode] [$name] $text';

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
 * @param {string}          name
 * @param {Error|string}    warning
 */
Log.warning = function(name, warning) {
    this.log(
        'warning',
        this.TEMPLATE
            .replace('$name', name)
            .replace('$text', warning)
    );
};

/**
 *
 * @param {string}          name
 * @param {Error|string}    error
 */
Log.error = function(name, error) {
    if(!(error instanceof Error)) {
        error = new Error(
            this.TEMPLATE
                .replace('$name', name)
                .replace('$text', error)
        );
    }

    throw error;
};

module.exports = Log;

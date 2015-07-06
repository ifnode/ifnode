'use strict';

var sprintf = require('sprintf').sprintf,
    log;

log = function(args) {
    console.log(this.form.apply(this, arguments));
    return this;
};

log.form = function(args) {
    args = [].slice.call(arguments);

    return sprintf.apply(null, args);
};

log.error = function(name, message) {
    var template = '[ifnode] [%s] %s',
        error;

    if(message instanceof Error) {
        error = message;
    } else {
        error = new Error(sprintf(template, name, message));
    }

    throw error;
};

module.exports = log;

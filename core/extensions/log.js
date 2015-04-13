var sprintf = require('sprintf').sprintf,

    log;

log = function(args) {
    args = [].slice.call(arguments);

    console.log(sprintf.apply(null, args));

    return this;
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

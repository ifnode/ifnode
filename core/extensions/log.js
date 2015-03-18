var sprintf = require('sprintf').sprintf,

    log = {};

log.console = function(args) {
    args = [].slice.call(arguments);

    console.log(sprintf.apply(null, args));

    return this;
};

log.file = function(filepath, args) {
    args = [].slice.call(arguments, 1);

    sprintf.apply(null, args);

    return this;
};

module.exports = log;

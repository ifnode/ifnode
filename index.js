var ifnode = require('./core/application');

ifnode._default_app_key = null;
ifnode._apps = {};

module.exports = function(options) {
    if(!options) {
        return ifnode._apps[ifnode._default_app_key];
    }
    if(typeof options === 'string') {
        return ifnode._apps[options];
    }

    var app = ifnode.make(options),
        key = app.alias || app.id;

    if(!ifnode._default_app_key) {
        ifnode._default_app_key = key;
    }

    return ifnode._apps[key] = app;
};

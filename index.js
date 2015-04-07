var Application = require('./core/application');

Application._default_app_key = null;
Application._apps = {};

module.exports = function(options) {
    if(!options) {
        return Application._apps[Application._default_app_key];
    }
    if(typeof options === 'string') {
        return Application._apps[options];
    }

    var app = Application(options),
        key = app.alias || app.id;

    if(!Application._default_app_key) {
        Application._default_app_key = key;
    }

    return Application._apps[key] = app;
};

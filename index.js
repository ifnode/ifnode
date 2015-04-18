var package_json = require('./package.json'),
    Application = require('./core/application'),

    ifnode;

Application._default_app_key = null;
Application._apps = {};

ifnode = function(options) {
    if(Application._default_app_key && !options) {
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

Object.defineProperty(ifnode, 'VERSION', {
    value: package_json.version
});

module.exports = ifnode;

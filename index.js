var ifnode = require('./core/application');

ifnode._default_app = null;
ifnode._apps = {};

module.exports = function(arg) {
    if(!arg) {
        return ifnode._apps[ifnode._default_app];
    }

    if(typeof arg === 'string') {
        return ifnode._apps[arg];
    }

    if(!ifnode._default_app) {
        ifnode._default_app = arg.alias;
    }

    return ifnode._apps[arg.alias] = ifnode.make(arg);
};

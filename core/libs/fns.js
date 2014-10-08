var is = function(type, obj) {
    return Object.prototype.toString.call(obj) === '[object ' + type + ']';
};

module.exports = {
    to_array: function(obj) {
        if(Array.isArray(obj)) {
            return obj;
        }
        return [obj];
    },

    each: function(obj, callback) {
        Object.keys(obj).forEach(function(key) {
            callback.call(obj, obj[key], key);
        });
    },
    fn_def: function(name, fn_name, fn) {

    },
    actions: function(/*obj, function_name, fn*/) {
        this._actions(type(arguments[0])).apply(this, arguments);
    },
    is_undefined: function(val) {
        return typeof val === 'undefined';
    },
    is_defined: function(val) {
        return !this.is_undefined(val);
    },
    is_object: function(obj) {
        return is('Object', obj);
    },
    is_string: function(str) {
        return is('String', str);
    },
    is_function: function(fn) {
        return is('Function', fn);
    }
};
module.exports = {
    uid: function(options) {
        options = options || {};

        return require('node-uuid').v4(options);
    },

    is_plain_object: function(v) {
        return Object.prototype.toString.call(v) === '[object Object]';
    },

    to_array: function(obj, at) {
        at = typeof at === 'number'? at : 0;

        if(Object.prototype.toString.call(obj) === '[object Arguments]') {
            return [].slice.call(obj, at);
        }
        if(Array.isArray(obj)) {
            return obj;
        }

        return [obj];
    }
};

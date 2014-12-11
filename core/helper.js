var uuid = require('node-uuid');

module.exports = {
    uid: function(options) {
        options = options || {};

        return uuid.v4(options);
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
    },

    location_init: function(site_config) {
        var origin_getter = function() {
                var protocol = this.ssl? 'https://' : 'http://',
                    port = this.port? ':' + this.port : '',
                    host = this.host? this.host : 'localhost';

                return protocol + host + port;
            },
            generate_url = function(pathname) {
                if(pathname[0] !== '/') {
                    pathname = '/' + pathname;
                }

                return this.origin + pathname;
            };

        Object.defineProperties(site_config, {
            'origin': { enumerable: true, get: origin_getter },
            'url': { enumerable: true, value: generate_url }
        });

        return site_config;
    }
};

'use strict';

var _ = require('lodash'),
    uuid = require('node-uuid');

module.exports = {
    uid: function(options) {
        options = options || {};

        return uuid.v4(options);
    },

    is_plain_object: function(v) {
        return Object.prototype.toString.call(v) === '[object Object]';
    },

    without_extension: function(path) {
        return path.split('.')[0];
    },

    to_array: function(obj, at) {
        if(!obj) {
            return [];
        }

        at = typeof at === 'number'? at : 0;

        if(Object.prototype.toString.call(obj) === '[object Arguments]') {
            return [].slice.call(obj, at);
        }
        if(Array.isArray(obj)) {
            return obj;
        }

        return [obj];
    },
    push: function(array, items) {
        items = Array.isArray(items)?
            items :
            [].slice.call(arguments, 1);

        if(items.length > 0) {
            [].push.apply(array, items);
        }
    },

    location_init: function(site_config, ssl) {
        var origin_getter = function() {
                var protocol = ssl? 'https://' : 'http://',
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
    },

    add_end_slash: function(str) {
        if(str[str.length - 1] !== '/') {
            str += '/';
        }

        return str;
    },

    deep_freeze: function(object) {
        var key,
            property;

        Object.freeze(object);

        for (key in object) {
            property = object[key];
            if (!object.hasOwnProperty(key) || !(typeof property === 'object') || Object.isFrozen(property)) {
                continue;
            }

            this.deep_freeze(property);
        }

        return object;
    },

    define_properties: function(object, properties) {
        var prototype_new_properties = {};

        Object.keys(properties).forEach(function(property_name) {
            var default_properties = {
                    //configurable: false,
                    enumerable: true,
                    //value: undefined,
                    //writable: false
                    //get: undefined,
                    //set: undefined
                },
                names = property_name.split(/\s*,\s*/),

                incoming_settings = properties[property_name],
                property_settings = {};

            if(typeof incoming_settings === 'function') {
                incoming_settings = { get: incoming_settings };
            }

            property_settings = _.defaults(incoming_settings, default_properties);

            names.forEach(function(name) {
                prototype_new_properties[name] = property_settings;
            });
        });

        Object.defineProperties(object, prototype_new_properties);
        Object.freeze(object);

        return object;
    }
};

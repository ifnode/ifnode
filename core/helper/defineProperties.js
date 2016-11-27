'use strict';

var _defaults = require('lodash/defaults');

/**
 *
 * @param   {Object}    object
 * @param   {Object}    properties
 * @returns {Object}
 */
function defineProperties(object, properties) {
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

        property_settings = _defaults(incoming_settings, default_properties);

        names.forEach(function(name) {
            prototype_new_properties[name] = property_settings;
        });
    });

    Object.defineProperties(object, prototype_new_properties);
    Object.freeze(object);

    return object;
}

module.exports = defineProperties;

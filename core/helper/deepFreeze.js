'use strict';
var _isPlainObject = require('lodash/lang/isPlainObject');

module.exports = function deepFreeze(object) {
    Object.freeze(object);
    Object.keys(object).forEach(function(key) {
        var property = object[key];

        if(
            !object.hasOwnProperty(key) ||
            !_isPlainObject(property) ||
            Object.isFrozen(property)
        ) {
            return;
        }

        deepFreeze(property);
    });

    return object;
};

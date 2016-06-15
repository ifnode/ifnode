'use strict';

module.exports = function deepFreeze(object) {
    Object.freeze(object);
    Object.keys(object).forEach(function(key) {
        var property = object[key];

        if(
            !object.hasOwnProperty(key) ||
            typeof property !== 'object' ||
            Object.isFrozen(property)
        ) {
            return;
        }

        deepFreeze(property);
    });

    return object;
};

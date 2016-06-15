'use strict';

module.exports = function toArray(obj, at) {
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
};

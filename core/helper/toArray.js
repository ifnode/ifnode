'use strict';

/**
 *
 * @param   {*}         [obj]
 * @param   {number}    [at=0]
 * @returns {Array.<*>}
 */
function toArray(obj, at) {
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
}

module.exports = toArray;

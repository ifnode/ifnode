var _isPlainObject = require('lodash/isPlainObject');

/**
 *
 * @param   {object}    object
 * @returns {object}
 */
function cloneDeepPrimitives(object) {
    var cloned = {};
    var keys = Object.keys(object);

    keys.forEach(function(key) {
        var value = object[key];

        cloned[key] = _isPlainObject(value) ?
            cloneDeepPrimitives(value) :
            value;
    });

    return cloned;
}

module.exports = cloneDeepPrimitives;

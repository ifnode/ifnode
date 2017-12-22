var isIFNodeItem = require('./isIFNodeItem');

/**
 *
 * @param   {Object}    object
 * @param   {string}    item_type
 * @returns {boolean}
 */
function isIFNodeItemInstance(object, item_type) {
    for (var constructor = object.constructor; constructor !== Function; constructor = constructor.constructor) {
        if (isIFNodeItem(constructor, item_type)) {
            return true;
        }
    }

    return false;
}

module.exports = isIFNodeItemInstance;

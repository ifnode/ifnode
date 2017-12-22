/**
 *
 * @param   {Function}  Base
 * @param   {string}    item_type
 * @returns {boolean}
 */
function isIFNodeItem(Base, item_type) {
    if (Base.__IFNODE_ITEM === item_type) {
        return true;
    }

    /**
     * Check of "util.inherits" classes
     */
    for (var proto = Base.super_; proto; proto = proto.super_) {
        if (proto.__IFNODE_ITEM === item_type) {
            return true;
        }
    }

    return false;
}

module.exports = isIFNodeItem;


/**
 *
 * @param   {Function}  Base
 * @param   {Function}  From
 * @returns {boolean}
 */
function isInheritsFrom(Base, From) {
    for (var proto = Base.prototype; proto !== Object.prototype; proto = Object.getPrototypeOf(proto)) {
        if (proto === From.prototype) {
            return true;
        }
    }

    return false;
}

module.exports = isInheritsFrom;

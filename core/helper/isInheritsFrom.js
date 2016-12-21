
/**
 *
 * @param   {*} Base
 * @param   {*} From
 * @returns {boolean}
 * @throws  {TypeError}
 */
function isInheritsFrom(Base, From) {
    if (Base === undefined || Base === null) {
        throw new TypeError('The constructor to "inherits" must not be null or undefined');
    }

    if (From === undefined || From === null) {
        throw new TypeError('The super constructor to "inherits" must not be null or undefined');
    }

    for (var proto = Base.prototype; proto !== Object.prototype; proto = Object.getPrototypeOf(proto)) {
        if (proto === From.prototype) {
            return true;
        }
    }

    return false;
}

module.exports = isInheritsFrom;

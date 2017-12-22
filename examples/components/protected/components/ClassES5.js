'use strict';

/**
 *
 * @class
 */
function ClassES5() {
    this._plain = 'ClassES5#plain';
}

Object.defineProperties(ClassES5, {
    STATIC: {
        value: 'ClassES5.STATIC'
    },
    getStatic: {
        value: function() {
            return this.STATIC;
        }
    },
    getName: {
        value: function() {
            return this.name;
        }
    }
});

ClassES5.prototype.plain = function() {
    return this._plain;
};

module.exports = ClassES5;

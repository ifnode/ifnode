'use strict';

/**
 *
 * @class
 */
function ClassES5() {
    this._plain = 'ClassES5#plain';
}

var ClassES5Statics = {
    STATIC: 'ClassES5.STATIC',
    getStatic: function() {
        return this.STATIC;
    },
    getName: function() {
        return this.name;
    }
};

if(Object.setPrototypeOf) {
    Object.setPrototypeOf(ClassES5, ClassES5Statics);
} else {
    Object.keys(ClassES5Statics).forEach(function(key) {
        ClassES5[key] = ClassES5Statics[key];
    });
}

ClassES5.prototype.plain = function() {
    return this._plain;
};

module.exports = ClassES5;

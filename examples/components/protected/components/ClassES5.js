'use strict';

var setPrototypeOf = require('setprototypeof');

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

setPrototypeOf(ClassES5, ClassES5Statics);

ClassES5.prototype.plain = function() {
    return this._plain;
};

module.exports = ClassES5;

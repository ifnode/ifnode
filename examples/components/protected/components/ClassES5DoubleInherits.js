'use strict';
var Util = require('util');
var ClassES5 = require('./ClassES5');

/**
 *
 * @class
 */
function ClassES5DoubleInherits() {
    ClassES5.call(this);

    this._plain2 = 'ClassES5DoubleInherits#plain';
}

Util.inherits(ClassES5DoubleInherits, ClassES5);

ClassES5DoubleInherits.prototype.plain2 = function() {
    return this._plain2;
};

module.exports = ClassES5DoubleInherits;

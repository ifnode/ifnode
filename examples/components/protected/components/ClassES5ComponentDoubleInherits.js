'use strict';

var Util = require('util');
var Component = require('./../../../../core/Component');

/**
 *
 * @class
 * @extends Component
 *
 * @param {Object}  options
 */
function Base(options) {
    Component.call(this, options);
}
Util.inherits(Base, Component);

Base.prototype.base_plain = function() {
    return 'Base#base_plain';
};

/**
 *
 * @class
 * @extends Base
 *
 * @param {Object}  options
 */
function ClassES5ComponentDoubleInherits(options) {
    Base.call(this, options);
}
Util.inherits(ClassES5ComponentDoubleInherits, Base);

ClassES5ComponentDoubleInherits.prototype.plain = function() {
    return 'ClassES5ComponentDoubleInherits#child_plain';
};

module.exports = ClassES5ComponentDoubleInherits;

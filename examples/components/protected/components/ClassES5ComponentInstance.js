'use strict';

var Util = require('util');
var Component = require('./../../../../core/Component');

/**
 *
 * @class
 * @extends Component
 *
 * @param options
 */
function ClassES5ComponentInstance(options) {
    Component.call(this, options);
}
Util.inherits(ClassES5ComponentInstance, Component);

ClassES5ComponentInstance.prototype.plain = function() {
    return 'ClassES5ComponentInstance#plain';
};

module.exports = new ClassES5ComponentInstance;

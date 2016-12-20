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
function ClassES5Component(options) {
    Component.call(this, options);
}
Util.inherits(ClassES5Component, Component);

ClassES5Component.prototype.plain = function() {
    return 'ClassES5Component#plain';
};

module.exports = ClassES5Component;

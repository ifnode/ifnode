'use strict';

var Util = require('util');
var Component = require('../../../../core/Component');

/**
 *
 * @class
 * @extends Component
 *
 * @param options
 */
function SomeComponentSame(options) {
    options.name = 'SomeComponent';
    Component.call(this, options);
}
Util.inherits(SomeComponentSame, Component);

module.exports = SomeComponentSame;

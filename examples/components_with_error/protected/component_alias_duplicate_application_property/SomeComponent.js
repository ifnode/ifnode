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
function SomeComponent(options) {
    options.alias = 'components';
    Component.call(this, options);
}
Util.inherits(SomeComponent, Component);

module.exports = SomeComponent;

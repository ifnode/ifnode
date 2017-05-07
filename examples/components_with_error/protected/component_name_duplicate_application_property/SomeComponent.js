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
function FirstComponent(options) {
    options.name = 'components';
    Component.call(this, options);
}
Util.inherits(FirstComponent, Component);

module.exports = FirstComponent;

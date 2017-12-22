var _defaults = require('lodash/defaults');
var Util = require('util');
var PLUGIN_TYPES = require('./../../../../../core/PLUGIN_TYPES');

/**
 * Copy of "core/Component". Simulates situation when component inherits another ifnode's Component class
 *
 * @class {Component}
 */
var Component = require('./Component');

module.exports[PLUGIN_TYPES.COMPONENT] = function() {
    /**
     *
     * @class
     * @extends Component
     *
     * @param {Object}  options
     */
    function PluginClassAnotherIFNodeComponent(options) {
        Component.call(this, _defaults(options, {
            alias: 'plugin_class_another_ifnode_component'
        }));
    }
    Util.inherits(PluginClassAnotherIFNodeComponent, Component);

    return PluginClassAnotherIFNodeComponent;
};

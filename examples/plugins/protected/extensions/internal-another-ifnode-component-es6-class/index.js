var _defaults = require('lodash/defaults');
var Util = require('util');
var PLUGIN_TYPES = require('./../../../../../core/PLUGIN_TYPES');
var Component = require('./../internal-another-ifnode-component-class/Component');

module.exports[PLUGIN_TYPES.COMPONENT] = function() {
    /**
     *
     * @class
     * @extends Component
     *
     * @param {Object}  options
     */
    function PluginES6ClassAnotherIFNodeComponent(options) {
        Component.call(this, _defaults(options, {
            alias: 'plugin_es6_class_another_ifnode_component'
        }));
    }
    Util.inherits(PluginES6ClassAnotherIFNodeComponent, Component);

    /**
     * Simulates access of static Component's member accessing
     *
     * @private
     * @type {string}
     */
    Object.defineProperty(PluginES6ClassAnotherIFNodeComponent, '__IFNODE_ITEM', {
        value: PLUGIN_TYPES.COMPONENT
    });

    return PluginES6ClassAnotherIFNodeComponent;
};

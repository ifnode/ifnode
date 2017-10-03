var _defaults = require('lodash/defaults');
var Util = require('util');
var Component = require('../../../../../core/Component');

module.exports = {
    component: function() {
        /**
         *
         * @class
         * @extends Component
         *
         * @param {Object}  options
         */
        function PluginClassComponent(options) {
            Component.call(this, _defaults(options, {
                alias: 'plugin_class_component'
            }));
        }
        Util.inherits(PluginClassComponent, Component);

        return PluginClassComponent;
    }
};

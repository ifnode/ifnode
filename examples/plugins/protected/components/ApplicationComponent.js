'use strict';

var Util = require('util');
var Component = require('./../../../../core/Component');
/**
 *
 * @type {Application}
 */
var app = require('./../../../..')('plugins');
var PluginComponent = app.component('PluginComponent');

/**
 *
 * @class
 * @extends Component
 *
 * @param options
 */
function ApplicationComponent(options) {
    Component.call(this, options);
}
Util.inherits(ApplicationComponent, Component);

ApplicationComponent.prototype.get_plugin_component = function() {
    return PluginComponent;
};

module.exports = ApplicationComponent;

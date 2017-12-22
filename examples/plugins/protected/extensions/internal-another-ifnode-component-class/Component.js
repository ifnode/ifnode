'use strict';

var UUID = require('uuid');
var toArray = require('./../../../../../core/helper/toArray');
var PLUGIN_TYPES = require('./../../../../../core/PLUGIN_TYPES');

/**
 *
 * @class Component
 *
 * @param {ComponentOptions}    options
 */
function Component(options) {
    this.id = UUID.v4();
    this.name = options.name;
    this.config = options.config;
    this.alias = toArray(options.alias);
}

Object.defineProperties(Component, {
    __IFNODE_ITEM: {
        value: PLUGIN_TYPES.COMPONENT
    }
});

module.exports = Component;

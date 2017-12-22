'use strict';

var UUID = require('uuid');
var _isInheritsFrom = require('./helper/isInheritsFrom');
var isIFNodeItem = require('./helper/isIFNodeItem');
var isIFNodeItemInstance = require('./helper/isIFNodeItemInstance');
var toArray = require('./helper/toArray');
var PLUGIN_TYPES = require('./PLUGIN_TYPES');

/**
 *
 * @typedef {Object}    ComponentOptions
 *
 * @property {string}           [name]
 * @property {Array.<string>}   [alias=[]]
 * @property {Object}           [config={}]
 */

/**
 *
 * @class Component
 *
 * @param {ComponentOptions}    [options={}]
 */
function Component(options) {
    options = options || {};

    this.id = UUID.v4();
    this.name = options.name || this.constructor.name;
    this.config = options.config || {};
    this.alias = toArray(options.alias);
}

Object.defineProperties(Component, {
    __IFNODE_ITEM: {
        value: PLUGIN_TYPES.COMPONENT
    },

    isInstanceOf: {
        /**
         *
         * @param   {*} object
         * @returns {boolean}
         */
        value: function isInstanceOf(object) {
            return !!object && (object instanceof this || isIFNodeItemInstance(object, this.__IFNODE_ITEM));
        }
    },

    isInheritsFrom: {
        /**
         *
         * @param   {*} Base
         * @returns {boolean}
         */
        value: function isInheritsFrom(Base) {
            return _isInheritsFrom(Base, this) || isIFNodeItem(Base, this.__IFNODE_ITEM);
        }
    }
});

module.exports = Component;

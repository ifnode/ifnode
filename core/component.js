'use strict';

var UUID = require('node-uuid');
var toArray = require('./helper/toArray');

/**
 *
 * @class Component
 *
 * @param   {Object}    options
 * @returns {Component}
 * @constructor
 */
function Component(options) {
    this.init(options);
}

/**
 *
 * @param {Object}  options
 */
Component.prototype.init = function(options) {
    this.id = UUID.v4();
    this.name = options.name;
    this.alias = toArray(options.alias);

    this.config = options.config;
};

module.exports = Component;

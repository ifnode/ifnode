'use strict';

var UUID = require('uuid');
var toArray = require('./helper/toArray');

/**
 *
 * @class Component
 *
 * @param {Object}          [options={}]
 * @param {string}          [options.name]
 * @param {Array.<string>}  [options.alias=[]]
 * @param {Object}          [options.config={}]
 */
function Component(options) {
    options = options || {};

    this.id = UUID.v4();
    this.name = options.name || this.constructor.name;
    this.alias = toArray(options.alias);
    this.config = options.config;
}

module.exports = Component;

'use strict';

var UUID = require('node-uuid');
var toArray = require('./helper/toArray');

var Component = function(options) {
    if(!(this instanceof Component)) {
        return new Component(options);
    }

    this.init(options);
};

Component.fn = Component.prototype;
Component.fn.init = function(options) {
    this.id = UUID.v4();
    this.name = options.name;
    this.alias = toArray(options.alias);

    this.config = options.config;
};

module.exports = Component;

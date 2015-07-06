'use strict';

var _ = require('lodash'),
    helper = require('./helper');

var Component = function(options) {
    if(!(this instanceof Component)) {
        return new Component(options);
    }

    this.init(options);
};

Component.fn = Component.prototype;
Component.fn.init = function(options) {
    this.id = helper.uid();
    this.name = options.name;
    this.alias = helper.to_array(options.alias);

    this.config = options.config;
};

module.exports = Component;

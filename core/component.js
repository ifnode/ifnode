var _ = require('underscore'),
    helper = require('./helper');

var Component = function(options) {
    if(!(this instanceof Component)) {
        return new Component(options);
    }
    this.init(options);
};

Component.fn = Component.prototype;
Component.fn.init = function(options) {
    this._id = helper.uid();
    this.name = options.name;

    this.alias = options.config.alias || [];
    this.disabled = options.config.disabled || false;

    if(!Array.isArray(this.alias)) {
        this.alias = [this.alias];
    }

    this.config = _.omit(options.config, [
        'alias',
        'disabled'
    ]);
};
Component.fn.methods = function(methods_list) {
    var self = this;

    Object.keys(methods_list).forEach(function(method_name) {
        self[method_name] = methods_list[method_name].bind(self);
    });
};

module.exports = Component;

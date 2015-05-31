'use strict';

var _copy_values = function(config) {
    var keys = Object.keys(config),
        i, key;

    for(i = keys.length; i--; ) {
        key = keys[i];
        this[key] = keys[key];
    }
};

exports.schema = function VirtualSchema(app, VirtualSchema) {
    VirtualSchema.schema = 'virtual';

    VirtualSchema.fn.initialize = function(model_config) {
        this.name = model_config.name || this.id;

        delete model_config.id;
        delete model_config.name;

        _copy_values.call(this, model_config);
    };
    VirtualSchema.fn.compile = function() {
        return this;
    };
};

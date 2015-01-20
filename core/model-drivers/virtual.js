var _ = require('lodash'),

    Schema = function(model_config) {
        if(!(this instanceof Schema)) {
            return new Schema(model_config);
        }

        this.name = model_config.name;
        this.table = model_config.table || this.name;
        this.init(model_config);
    };

Schema.fn = Schema.prototype;

Schema.fn.init = function(config) {
    var self = this,
        options = _.omit(config, [
            'name',
            'table'
        ]);

    Object.keys(options).forEach(function(key) {
        if(key in self) {
            throw new Error('Key ' + key + ' already busy');
        }

        self[key] = options[key];
    });
};
Schema.fn.compile = function() {
    return this;
};

module.exports = function(db_config) {
    return Schema;
};

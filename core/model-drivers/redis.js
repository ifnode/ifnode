var Schema = function(model_config) {
    if(!(this instanceof Schema)) {
        return new Schema(model_config);
    }
    this.table = model_config.table;
    this.statics = {};
};
Schema.fn = Schema.prototype;

Schema.connect_driver = function(db_config) {
    var redis = require('redis'),
        redis_params = [];

    if(db_config.host && db_config.port) {
        redis_params = [db_config.port, db_config.host];
    }
    if(db_config.options) {
        redis_params.push(db_config.options);
    }

    Schema.fn._driver = redis.createClient.apply(redis, redis_params);
};
Schema.fn.compile = function() {
    var model = this._driver;

    for(var i in this.statics) {
        if(typeof this.statics[i] === 'function') {
            model[i] = this.statics[i].bind(this._driver);
        }
    }

    return model;
};

module.exports = function(db_config) {
    Schema.connect_driver(db_config);
    return Schema;
};

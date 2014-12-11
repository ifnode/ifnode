var Schema = function(model_config) {
    if(!(this instanceof Schema)) {
        return new Schema(model_config);
    }

    this.name = model_config.name;
    this.table = model_config.table || this.name;
};
Schema.fn = Schema.prototype;

Schema.fn.compile = function() {
    return this;
};

module.exports = function(db_config) {
    return Schema;
};

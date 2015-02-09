var SchemaFactory = function() {
    var Schema = function(model_config) {
        if(!(this instanceof Schema)) {
            return new Schema(model_config);
        }

        (this.init || this.initialize).call(this, model_config);
    };

    Schema.fn = Schema.prototype;

    return Schema;
};

module.exports = SchemaFactory;

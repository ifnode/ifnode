'use strict';
var helper = require('./helper');

module.exports = function SchemaFactory() {
    var Schema = function(model_config) {
        if(!(this instanceof Schema)) {
            return new Schema(model_config);
        }

        var initialize_method = this.initialize || this.init;

        this.id = helper.uid();

        if(initialize_method) {
            initialize_method.call(this, model_config);
        }
    };

    Schema.fn = Schema.prototype;

    return Schema;
};

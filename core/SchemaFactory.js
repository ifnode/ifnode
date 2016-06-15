'use strict';

var UUID = require('node-uuid');

module.exports = function SchemaFactory() {
    var Schema = function(model_config) {
        if(!(this instanceof Schema)) {
            return new Schema(model_config);
        }

        var initialize_method = this.initialize || this.init;

        this.id = UUID.v4();

        if(initialize_method) {
            initialize_method.call(this, model_config);
        }
    };

    Schema.fn = Schema.prototype;

    return Schema;
};

'use strict';

/**
 *
 * @interface SchemaInterface
 */


var UUID = require('node-uuid');

module.exports = function SchemaFactory() {
    /**
     *
     * @param   {Object}    model_config
     * @returns {Schema}
     * @constructor
     */
    function Schema(model_config) {
        var initialize_method = this.initialize || this.init;

        this.id = UUID.v4();

        if(initialize_method) {
            initialize_method.call(this, model_config);
        }
    }

    Schema.fn = Schema.prototype;

    return Schema;
};

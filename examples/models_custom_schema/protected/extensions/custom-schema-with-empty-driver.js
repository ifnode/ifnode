var SCHEMA = require('./../../../../core/PLUGIN_TYPES').SCHEMA;

module.exports[SCHEMA] = function(app, CustomSchema) {
    CustomSchema.schema = 'custom-schema-with-empty-driver';
    CustomSchema.driver = function driver() {
    };

    CustomSchema.prototype.init = function initialize(options) {
        this.name = options.name;
    };
    CustomSchema.prototype.compile = function compile() {
        return this;
    };

    return CustomSchema;
};

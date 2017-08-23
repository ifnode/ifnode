var SCHEMA = require('./../../../../core/PLUGIN_TYPES').SCHEMA;

module.exports[SCHEMA] = function(app, CustomSchemaWithoutConstructor) {
    CustomSchemaWithoutConstructor.schema = 'custom-schema-without-constructor';
    CustomSchemaWithoutConstructor.prototype.compile = function compile() {
        return this;
    };

    return CustomSchemaWithoutConstructor;
};

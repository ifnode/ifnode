/**
 *
 * @class SchemasList
 */
function SchemasList() {
    this._schemas_drivers = {};
}

/**
 *
 * @param {ISchema} Schema
 */
SchemasList.prototype.attach_schema = function attach_schema(Schema) {
    this._schemas_drivers[Schema.schema] = Schema;
};

/**
 *
 * @param   {string}    name
 * @returns {?ISchema}
 */
SchemasList.prototype.get_schema = function get_schema(name) {
    return this._schemas_drivers[name] || null;
};

module.exports = SchemasList;

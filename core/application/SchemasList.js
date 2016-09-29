/**
 *
 * @class SchemasList
 * @constructor
 */
function SchemasList() {
    this._constructor();
}

/**
 *
 * @private
 */
SchemasList.prototype._constructor = function() {
    this._schemas_drivers = {};
};

/**
 *
 * @param {SchemaInterface} Schema
 */
SchemasList.prototype.attach_schema = function attach_schema(Schema) {
    this._schemas_drivers[Schema.schema] = Schema;
};

/**
 *
 * @param   {string}    name
 * @returns {?SchemaInterface}
 */
SchemasList.prototype.get_schema = function get_schema(name) {
    return this._schemas_drivers[name] || null;
};

module.exports = SchemasList;

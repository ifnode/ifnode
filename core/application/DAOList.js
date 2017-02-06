/**
 *
 * @param {SchemasList} schemas_list
 * @param {Object}      db
 * @constructor
 */
function DAOList(schemas_list, db) {
    this._constructor(schemas_list, db);
}

/**
 *
 * @param {SchemasList} schemas_list
 * @param {Object}      db
 * @private
 */
DAOList.prototype._constructor = function(schemas_list, db) {
    this._schemas_list = schemas_list;
    this._daos = {};
    this._daos_drivers = {};
    this._default_dao_name = '';

    this._initialize_schemas(db);
};

/**
 *
 * @returns {string}
 */
DAOList.prototype.get_default_dao_name = function() {
    return this._default_dao_name;
};

/**
 *
 * @param   {string}    name
 * @returns {?Function}
 */
DAOList.prototype.get_dao = function get_dao(name) {
    return this._daos[name] || null;
};

/**
 *
 * @param   {string}    name
 * @returns {?Function}
 */
DAOList.prototype.get_dao_driver = function get_dao_driver(name) {
    return this._daos_drivers[name] || null;
};

DAOList.prototype._initialize_schemas = function _initialize_schemas(db) {
    var self = this;
    var db_connections_names = Object.keys(db);

    this._default_dao_name = db_connections_names[0];

    db_connections_names.forEach(function(db_connection_name) {
        var db_config = db[db_connection_name];
        var schema_driver = self._schemas_list.get_schema(db_config.schema);

        if(db_config.default) {
            self._default_dao_name = db_connection_name;
        }

        if(schema_driver.driver) {
            var driver = schema_driver.driver(db_config.config);

            if(driver) {
                schema_driver.fn._driver = driver;
                self._daos_drivers[db_connection_name] = driver;
            }
        }

        self._daos[db_connection_name] = schema_driver;
    });
};

module.exports = DAOList;

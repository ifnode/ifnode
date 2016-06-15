var _isPlainObject = require('lodash/isPlainObject');
var toArray = require('./../helper/toArray');

var Path = require('path');
var Diread = require('diread');

module.exports = function(Application) {
    Application.prototype._schemas_drivers = {};
    Application.prototype._initialize_schemas = function() {
        var self = this,
            db = this._config.db,
            schemas_drivers = this._schemas_drivers,
            schemas = this._schemas,

            db_connections_names;

        if(!db) {
            return;
        }

        db_connections_names = Object.keys(db);
        if(!db_connections_names.length) {
            return;
        }

        self._default_creator = db_connections_names[0];
        db_connections_names.forEach(function(db_connection_name) {
            var db_config = db[db_connection_name],
                schema_driver = schemas_drivers[db_config.type];

            if(db_config.default) {
                self._default_creator = db_connection_name;
            }


            if(schema_driver.driver) {
                schema_driver.driver(db_config);
            }
            schemas[db_connection_name] = schema_driver;
        });
    };
    Application.prototype._initialize_models = function() {
        var models_folder = this.config.application.folders.models;

        Diread({
            src: Path.resolve(this._project_folder, models_folder)
        }).each(function(model_file_path) {
            require(model_file_path);
        });
    };
    Application.prototype._compile_models = function() {
        var model_prototypes = this._model_prototypes,
            app_models = this._models,

            compile;

        compile = function(model_id) {
            var model_prototype = model_prototypes[model_id],
                compiled_model = model_prototype.__schema.compile(),
                options = model_prototype.options;

            app_models[model_id] = compiled_model;

            if(options.alias) {
                toArray(options.alias).forEach(function(alias) {
                    if(alias in app_models) {
                        throw new Error('Alias {' + alias + '} already busy');
                    }

                    app_models[alias] = compiled_model;
                });
            }
        };

        Object.keys(model_prototypes).forEach(compile);
        delete this._model_prototypes;
    };
    Application.prototype._init_models = function() {
        this._model_prototypes = {};

        this._schemas = {};
        this._models = {};
        this._initialize_schemas();
        this._initialize_models();
        this._compile_models();
    };

    Application.prototype.attach_schema = function(Schema) {
        this._schemas_drivers[Schema.type] = Schema;
    };
    Application.prototype.Model = function(model_config, options) {
        if(typeof options !== 'undefined') {
            if(_isPlainObject(options)) {
                options.type = options.type || this._default_creator;
            } else {
                options = { type: options };
            }
        } else {
            options = { type: this._default_creator };
        }

        var schema = this._schemas[options.type](model_config);

        this._model_prototypes[schema.table] = {
            __schema: schema,
            options: options
        };

        return schema;
    };
};

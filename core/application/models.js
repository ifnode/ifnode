'use strict';

var debug = require('debug')('ifnode:models'),
    path = require('path'),
    diread = require('diread'),

    helper = require('./../helper'),
    log = require('./../extensions/log');

module.exports = function(Application) {
    Application.fn._initialize_schemas = function() {
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
                schema_driver = schemas_drivers[db_config.schema],
                driver;

            if(db_config.default) {
                self._default_creator = db_connection_name;
            }

            if(schema_driver.driver) {
                driver = schema_driver.driver(db_config.config);

                if(typeof driver !== 'undefined') {
                    schema_driver.fn._driver = driver;
                }
            }
            schemas[db_connection_name] = schema_driver;
        });
    };
    Application.fn._initialize_models = function() {
        diread({
            src: this.config.application.folders.models
        }).each(function(model_file_path) {
            require(model_file_path);
        });
    };
    Application.fn._compile_models = function() {
        var model_prototypes = this._model_prototypes,
            app_models = this._models;

        Object.keys(model_prototypes).forEach(function(model_unique_name) {
            var model_prototype = model_prototypes[model_unique_name],
                compiled_model = model_prototype.model_prototype.compile(),
                options = model_prototype.options;

            app_models[model_unique_name] = compiled_model;

            if(options.alias) {
                helper.to_array(options.alias).forEach(function(alias) {
                    if(alias in app_models) {
                        log.error('models', 'Alias [' + alias + '] already busy.');
                    }

                    app_models[alias] = compiled_model;
                });
            }
        });
    };
    Application.fn._init_models = function() {
        this._model_prototypes = {};

        this._schemas = {};
        this._models = {};
        this._initialize_schemas();
        this._initialize_models();
        this._compile_models();
    };

    Application.fn.attach_schema = function(Schema) {
        if(!this._schemas_drivers) {
            this._schemas_drivers = {};
        }

        this._schemas_drivers[Schema.schema] = Schema;
    };
    Application.fn.Model = function(model_config, options) {
        if(typeof options === 'string') {
            options = { db: options }
        } else if(helper.is_plain_object(options)) {
            options.db = options.db || this._default_creator;
        } else {
            options = { db: this._default_creator };
        }

        var model_prototype = this._schemas[options.db](model_config),
            model_unique_name = model_prototype.name || model_prototype.table || model_prototype.collection;

        if(model_unique_name in this._model_prototypes) {
            log.error('models', 'Name [' + model_unique_name + '] already busy.');
        }

        this._model_prototypes[model_unique_name] = {
            model_prototype: model_prototype,
            options: options
        };

        return model_prototype;
    };
};

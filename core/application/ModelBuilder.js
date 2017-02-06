'use strict';

var _isPlainObject = require('lodash/isPlainObject');
var toArray = require('./../helper/toArray');
var Log = require('./../Log');

/**
 *
 * @class ModelBuilder
 *
 * @param {DAOList} dao_list
 * @constructor
 */
function ModelBuilder(dao_list) {
    this._dao_list = dao_list;
    this._model_prototypes = {};
}

/**
 *
 * @param   {Object}    model_config
 * @param   {Object}    [options]
 * @returns {Function}
 */
ModelBuilder.prototype.make = function make(model_config, options) {
    if(typeof options === 'string') {
        options = { db: options };
    } else if(_isPlainObject(options)) {
        options.db = options.db || this._dao_list.get_default_dao_name();
    } else {
        options = { db: this._dao_list.get_default_dao_name() };
    }

    var db_name = options.db;
    var dao_list = this._dao_list;
    var DAO = dao_list.get_dao(db_name);

    /**
     * @todo Hack for backward compatibility. Will be removed in 2.0
     * @type {Function}
     * @private
     */
    DAO.prototype._driver = dao_list.get_dao_driver(db_name);

    var model_prototype = new DAO(model_config);
    var model_unique_name = model_prototype.name || model_prototype.table || model_prototype.collection;

    if(model_unique_name in this._model_prototypes) {
        Log.error('models', 'Name [' + model_unique_name + '] already busy.');
    }

    this._model_prototypes[model_unique_name] = {
        db_name: db_name,
        model_prototype: model_prototype,
        options: options
    };

    return model_prototype;
};

/**
 *
 * @param   {Application}   app
 * @returns {Object.<string, Function>}
 */
ModelBuilder.prototype.compile_models = function compile_models(app) {
    var dao_list = this._dao_list;
    var model_prototypes = this._model_prototypes;

    return Object.keys(model_prototypes).reduce(function(models, model_unique_name) {
        var model_prototype = model_prototypes[model_unique_name];

        var dao_driver = dao_list.get_dao_driver(model_prototype.db_name);
        var prototype = model_prototype.model_prototype;

        /**
         * @todo Hack for backward compatibility. Will be removed in 2.0
         * @type {Function}
         * @private
         */
        prototype._driver = dao_driver;

        var compiled_model = prototype.compile();
        var options = model_prototype.options;

        models[model_unique_name] = compiled_model;
        app.models[model_unique_name] = compiled_model;

        if(options.alias) {
            toArray(options.alias).forEach(function(alias) {
                if(alias in models) {
                    Log.error('models', 'Alias [' + alias + '] already busy.');
                }

                models[alias] = compiled_model;
                app.models[alias] = compiled_model;
            });
        }

        return models;
    }, {});
};

module.exports = ModelBuilder;

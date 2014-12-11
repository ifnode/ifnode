var _ = require('lodash'),

    Schema = function(model_config) {
        if(!(this instanceof Schema)) {
            return new Schema(model_config);
        }

        this._model_config = model_config;

        this.table = model_config.table;
        this._columns = model_config.columns || {};
        this._schema_config = _.defaults(model_config.config || {}, this._default_schema_config);
        //this._schema_config = _.extend(this._default_schema_config, model_config.config || {});
        this.init(model_config);
    };
Schema.fn = Schema.prototype;

Schema.connect_driver = function(db_config) {
    var mongoose = require('mongoose');
    mongoose.connect(db_config.url);

    Schema.fn._driver = mongoose;
}
Schema.fn.init = function() {
    this._initialize_schema();
    this.statics = this._schema.statics = {};
    this.methods = this._schema.methods = {};
};
Schema.fn.compile = function() {
    this._model = this._driver.model(this.table, this._schema);

    return this._model;
};

Schema.fn._default_schema_config = {
    id: false,
    versionKey: false,
    strict: true
};

Schema.fn._initialize_schema = function() {
    if(
        !Object.keys(this._columns).length &&
        this._schema_config.strict === this._default_schema_config.strict
    ) {
        this._schema_config.strict = false;
    }

    this._schema = this._driver.Schema(this._columns, this._schema_config);

    //this._schema.set('toJSON', {
    //    transform: function (doc, ret, options) {
    //        ret.id = ret._id;
    //        delete ret._id;
    //    }
    //});
};
Schema.fn.get_original_schema = function() {
    return this._schema;
};
Schema.fn.model = function() {
    return this._model;
};
Schema.fn.create = function() {
    return this._model.create.apply(this._model, arguments);
};
Schema.fn.pre = function() {
    return this._schema.pre.apply(this._schema, arguments);
};

module.exports = function(db_config) {
    Schema.connect_driver(db_config);

    return Schema;
};

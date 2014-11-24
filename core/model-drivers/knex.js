var Schema = function(model_config) {
    if(!(this instanceof Schema)) {
        return new Schema(model_config);
    }

    this.table = model_config.table;
    // this._columns = model_config.columns;
    // this._config = model_config;
    this.init(model_config);
};


Schema.fn = Schema.prototype;
Schema.fn.init = function() {
    this.driver = Schema.fn._driver;
    this.all = function(){
        return this.driver(this.table);
    }
    // this._schema = this._driver.Schema(this._columns);
    // this.statics = this._schema.statics = {};
    // this.methods = this._schema.methods = {};
};


Schema.connect_driver = function(db_config) {
    var knex = require('knex')(db_config);
    Schema.fn._driver = knex;
};

Schema.fn.compile = function() {
    this._model = this;
};

module.exports = function(db_config) {
    Schema.connect_driver(db_config);
    return Schema;
};

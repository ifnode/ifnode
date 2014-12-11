var Schema = function(model_config) {
    if(!(this instanceof Schema)) {
        return new Schema(model_config);
    }

    this.table = model_config.table;
    this.init(model_config);
};
Schema.fn = Schema.prototype;

Schema.connect_driver = function(db_config) {
    var knex = require('knex')(db_config);
    Schema.fn._driver = knex;
};
Schema.fn.init = function() {
    this.driver = Schema.fn._driver;
    this.all = function(){
        return this.driver(this.table);
    }
};
Schema.fn.compile = function() {
    return this;
};

module.exports = function(db_config) {
    Schema.connect_driver(db_config);
    return Schema;
};

## app.Model

Returns `model` instance:

```javascript
app.Model(Object model_options [, Object schema_options])
```

All model's schemas must be added by plugins (like [`ifnode-mongoose`](/ifnode/mongoose)).

Default schema is `virtual`. Code of `virtual` schema is find [here](/ilfroloff/ifnode/blob/master/plugins/ifnode-virtual/index.js)
### Parameters:

#### model_options:

Options to create model instance. All options are specified by model's schema.

Below recommended options:

Option | Type | Description
:------ | :---- | :-----------
.name | String | Name of model
.table | String | Name of table (for SQL databases: MySQL, PostgreSQL, etc)
.collection | String | Name of collection (for NoSQL databases: mongodb, redis, etc)
.columns | Object | Describe table or collection columns (example: `mongoose` options `columns`)

#### schema_options:

Options for build model's schema.

Option | Type | Description | Default
:------ | :---- | :----------- | :------
.db | String | Name of database (one of keys in `config.db`) | First in `config.db` or `virtual`
.alias | String &#10072; Array | Aliases of model (in `app.models`) | -

### Create own Schema:

Example:

```javascript
// own-schema.js
exports.schema = function(app, Schema) {
    Schema.schema = 'name-of-schema';
    Schema.driver = function(db_config) {
        // driver initaialize
        return driver;
    };

    Schema.fn.initialize = function(model_config) {
        // model instance initialize
    };
    Schema.fn.compile = function() {
        // returns model instance which accessed by app.models[name]
        return model;
    };
};
```

Real schema `ifnode-knex.js`:

```javascript
// knex.js
var knex = require('knex');

exports.schema = function(app, KnexSchema) {
    KnexSchema.schema = 'knex';
    KnexSchema.driver = function(db_config) {
        return knex(db_config);
    };

    KnexSchema.fn.initialize = function(model_config) {
        this.table = model_config.table;
        this.driver = this._driver;
        
        this.all = function() {
            return this.driver(this.table);
        };
    };
    KnexSchema.fn.compile = function() {
        return this;
    };
};
```

Description of field:

Options | Description | Optional
------- | ----------- | --------
.schema | Name of schema
.driver(Object db_config) | Static method for initializing of schema driver | true
.fn | Alias of `Schema.prototype` | -
.fn._driver | Results of `.driver()` method | -
.fn.initialize(Object model_config) | Create model instance by schema | true
.fn.compile() | Return final model instance (this model can access by `app.models`) | false

Aliases:

Options | Description
------- | -----------
.fn.init() | Alias of `.fn.initialize()`
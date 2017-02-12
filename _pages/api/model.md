# Model

## Description

Model is a presentation of [**Data Access Layer**](/docs/app/#models) on `ifnode` architecture and is a other core part in `ifnode` application. 
`Model` must be presented by some "mediator" (or `Schema` by `ifnode`'s terminology) between `ifnode` application and external data access module.

`Schema` can be `npm` module 
(like [`ifnode-mongoose`](https://npmjs.com/package/ifnode-mongoose)) or can be own application `Schema` which placed in `extensions` folder (f.e [`my-knex-mediator`](#my-knex-mediator)). 
Also `ifnode` has [`virtual`](https://github.com/ifnode/ifnode/blob/master/plugins/ifnode-virtual/index.js) schema which is default for any model.

More about `ifnode` models you can read **[here](/docs/app/models)**

## Definition

### TypeScript syntax

```typescript
interface Model {
    new (model_options: Object, db_options?: Object)
}
```

## Model#constructor( model_options [, db_options] )

### Arguments

#### model_options

Options to create model instance. All options are specified by model's `Schema`. Example of `model_options` you can find on 
[`ifnode-mongoose`](https://www.npmjs.com/package/ifnode-mongoose#model_options-required) module.

#### db_options

| Name | Type | Description |
| ---- | ---- | ----------- |
| `db` | `string` | Set data connection from application configuration. It's one of application's connectors names (from [`app.config.db`](/docs/app/config/#db)) or default `virtual` |
| `alias` | `string`, `Array<string>` | Aliases of model. They will be attached to `app.models` |

## Create own Schema

`Schema` can be created by exporting special method `schema` from module. Method has two arguments `app` and `Schema`.

`app` is an instance of current application, `Schema` is class for creating model instances and it must to be extended

### Schema class

`Schema` has predefined methods and properties. Below list of them.

#### Static properties and methods

*Note: **required** mark means that method or setter must to be realized or set, **optional** is not required for definiton*

#### Schema.schema (required)

It is a setter property and it name of the `Schema`. Name must to be set.

Name is used by [`db`](/docs/app/config/#db) configuration (`schema` option) for picking required `Schema`.

#### Schema.driver( config ) (optional)

Method is used by setting up `Schema`'s driver. Driver can be presented by some `npm` or internal module. Argument `config` 
gets from [`db`](/docs/app/config/#db) configuration (`config` option).

#### Instance properties and methods

##### Property

| Name | Type | Description |
| ---- | ---- | ----------- |
| `_driver` | `any` | Driver instance. There is same as returned value from static `driver` method |

*Note: `_driver` will be attached automatically to instance by `ifnode`*

##### Methods

*Note: methods must to be defined across `prototype` property*

###### Schema#initialize( model_config ) (required)

Method of creating model instance which will be returned by `app.Model`. Argument `model_config` is first argument of 
`app.Model` invoking.

***Aliases:***

* `Schema#init( model_config )`

###### Schema#compile() (required)

Building of final model instance which will be attached to `app.models`.

##### Example of usage

```javascript
// own-schema.js
exports.schema = function(app, Schema) {
    Schema.schema = 'name-of-schema';
    Schema.driver = function(db_config) {
        // driver initialize
        return SomeDriverFactory(db_config);
    };

    Schema.prototype.initialize = function(model_config) {
        // model instance initialize
        this.data_accessor = this._driver(model_config);
    };
    Schema.prototype.compile = function() {
        // returns model instance which accessed by app.models[name]
        return this;
    };
};
```

##### My Knex Mediator

Simple schema to provide connection between `knex` module and `ifnode` application:

```javascript
// protected/extensions/my-knex-mediator.js
'use strict';
const Knex = require('knex');

exports.schema = function(app, KnexSchema) {
    KnexSchema.schema = 'my-knex-mediator';
    KnexSchema.driver = function(db_config) {
        return Knex(db_config);
    };
    
    KnexSchema.prototype.initialize = function(model_config) {
        this.table = model_config.table;
        this.driver = this._driver;
        
        this.all = function() {
            return this.driver(this.table);
        };
    };
    KnexSchema.prototype.compile = function() {
        return this;
    };
};
```

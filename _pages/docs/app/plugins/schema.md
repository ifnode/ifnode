## Schema plugin

Possibility to create own schema plugin to `ifnode`.

Schema is middleware between `ifnode` models and database module (mongoose, knex, etc).

### Creating own plugin
Below example of simple plugin `memorystore` for store data in RAM:

Plugin file:

```javascript
// extensions/memorystore.js    
var util = require('util');

exports.schema = function(app, MemoryStore) {
    // name of schema
    MemoryStore.schema = 'memory';

    // initialize method for each new model instance
    MemoryStore.fn.initialize = function(model_config) {
        util._extend(this, model_config);

        this._values = {};
        this.table = this.table || this.name;

        return this;
    };

    // create ended model which accessing by app.models['name']
    MemoryStore.fn.compile = function() {
        return this;
    };

    MemoryStore.fn.set = function(key, value) {
        return this._values[key] = value;
    };
    MemoryStore.fn.get = function(key) {
        if(typeof key === 'undefined') {
            return this._values;
        } else {
            return this._values[key] || null;
        }
    };
    MemoryStore.fn.remove = function(key) {
        delete this._values[key];
        return true;
    };
    MemoryStore.fn.has = function(key) {
        return key in this._values;
    };

    MemoryStore.fn.to_array = function() {
        var values = this._values,
            keys = Object.keys(values);

        return keys.map(function(key) {
            return values[key];
        });
    };
};
```

Model file:

```javascript
// models/users.js    
var app = require('ifnode')(),
    users_model = app.Model({
        name: 'users'
    });

users_model.get_all = function() {
    return this.to_array();
};
```

Application file:

```javascript
// app.js    
var ifnode = require('ifnode'),
    app = ifnode();

app.register('memorystore');
app.load();

app.models.users.set(1, { id: 1, name: 'ilfroloff' });
app.models.users.get_all(); // [{ id: 1, name: 'ilfroloff' }]
```

## Real examples
* **[ifnode-virtual](https://github.com/ifnode/ifnode/blob/master/plugins/ifnode-virtual/index.js)**
* **[ifnode-mongoose](https://github.com/ifnode/mongoose)**
# Models

Model is database presentation of tables (SQL) or collections (NoSQL) data.

`ifnode` model is middleware between native npm module for database (mongoose, knex, etc) and real using. `ifnode` make all dirty work for initialize and populate all application data presentations.

## Example

Create `mongodb` model using `ifnode-mongoose` - middleware between `mongoose` module and `ifnode`:

Creating config file with database options:

```javascript
// config/local.js    
module.exports = {
    db: {
        mongo: {
            schema: 'mongoose',
            config: {
                database: 'library',
                host: 'localhost'
            }
        }
    }
};
```

Creating books model:

```javascript
// models/books.js    
var app = require('ifnode')(),
    books = app.Model({
        collection: 'books'
    });
```

Application file:

```javascript
// app.js    
var ifnode = require('ifnode'),
    app = ifnode({
        env: 'local'
    });

// load all models and initialize them
app.load();
app.models.books.findOne(); // return instance of mongoose.Model
```
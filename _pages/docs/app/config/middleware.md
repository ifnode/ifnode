# Middleware

Middleware is special field of `config.application`. Here can set different `express.js` middleware and create own.

## Set middleware

Can three possibilities to set middleware:

* By object
* By array
* By function

Notes:

1. in `by object` and `by array` key is name of npm module. 
2. in `by function` key can be any.


Order of middleware load is `natural` (first key - first load, second key - second load, etc)

## by object

For middleware where options is one object. For example, *[connect-multiparty](https://www.npmjs.com/package/connect-multiparty)*:

```javascript
{
    application: {
        middleware: {
            'connect-multiparty': {
                maxFilesSize: 10 * 1024 * 1024 // '10mb'
            }
        }
    }
}
```
    
## by array

For middleware where options is several agruments. For example, *[serve-static](https://www.npmjs.com/package/serve-static)*:

```javascript
{
    application: {
        middleware: {
            'serve-static': ['public/', { extensions: ['js', 'css'] }]
        }
    }
}
```
    
## by function

"Raw" set of middleware. Possibility to create own middleware or attach any external middleware:

```javascript
var session = require('express-session'),
    connect_mongo = require('connect-mongo')(session);

{
    application: {
        middleware: {
            'own-middleware': function(app, express) {
                app.use(function(request, response, next) {
                    // do something
                    next();
                });
            },
            'attach-session': function(app) {
                app.use(session({
                    resave: false,
                    saveUninitialized: true,
                    cookie: {},

                    store: new connect_mongo({
                        db: 'database',
                        host: 'localhost',
                        port: 27017
                    })
                }));
            }
        }
    }
}
```
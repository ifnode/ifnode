# Controllers (Requests Layer)

Controller is item for building routes system of `ifnode` application.

## Initializing

@TODO

### Notes

Controller's filename `!.js` and `~.js` are special. Those filenames not participate in forming name and root options.

`!.js` always initialize first in folder. Next loaded controllers into folders, and next files
`~.js` always initialize last in folder

#### Example

##### protected/controllers/api/v1/!.js


```javascript
const controller = app.Controller();
controller.name // api/v1
controller.root // /api/v1/
```

##### protected/controllers/api/v1/user.js

```javascript
const controller = app.Controller({
    root: '/user'
});
controller.name // api/v1/user
controller.root // /user
```

## Definition by `map`

@TODO

## Example

Create simple controller for two routes `/` and `/api/login` with options.

View `index.jade`:

```jade
// views/index.jade
div Hello World!
```

Creating controller file:

```javascript
// controllers/!.js
var app = require('ifnode')(),
    main_controller = app.Controller({
        name: 'main',
        root: '/'
    });

main_controller.get(function(request, response) {
    response.render('index');
});
main_controller.get('/api/login', { ajax: true }, function(request, response, next) {
    get_user(function(err, user) {
        if(err) { return next(err); }

        request.login(user, function(err) {
            if(err) { return next(err); }

            response.redirect('/');
        });
    });
});
```

Application file:

```javascript
// app.js    
var ifnode = require('ifnode'),
    app = ifnode();

// run webserver
app.run();
```

Test case:

```bash
curl localhost:8080 # status 200, <div>Hello World!</div>
curl localhost:8080/api/login # status 400, Only AJAX request
```
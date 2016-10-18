## Controllers
Controller is item for building routes system of `ifnode` application. 

### Example
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
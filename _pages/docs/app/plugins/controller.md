## Controller plugin
Possibility to create own controller plugin to `ifnode`.

### Creating own plugin
Below example of simple plugin `ip-filter` for filter access by user ip.

Plugin file:

```javascript
// extensions/ip-filter
module.exports.controller = function(app, Controller) {
    // check needed controller plugin options
    Controller.process_config(function(controller_config) {
        if(is_invalid_ip(controller_config.forbidden_ip)) {
            delete controller_config.forbidden_ip;
        }

        if(is_invalid_ip(controller_config.skip_ip)) {
            delete controller_config.skip_ip;
        }
    });

    // populate by own methods/properties request or response
    Controller.populate(function(request, response, next_handler, next_route) {
        request.user_ip = request.headers['x-forwarded-for'] ||
            request.connection.remoteAddress ||
            request.socket.remoteAddress ||
            request.connection.socket.remoteAddress;

        response.forbidden_ip_address = function() {
            this.status(401).send("Access denied for user's ip");
        };
    });

    // set controller middleware
    Controller.middleware(
        function(controller_options) {
            var forbidden_ip = controller_options.forbidden_ip;
    
            return function(request, response, next_handler, next_route) {
                if(request.user_ip === forbidden_id) {
                    return response.forbidden_ip_address();
                }
    
                next_handler();
            };
        },
        function(controller_options) {
            var skip_ip = controller_options.skip_ip;
    
            return function(request, response, next_handler, next_route) {
                if(request.user_ip === skip_ip) {
                    return next_route(); // jump to next route
                }
    
                next_handler();
            };
        }
    );
};
```

Controller file:

```javascript
// controllers/!.js
var app = require('ifnode')(),
    main_controller = app.Controller({
        forbidden_ip: '127.0.0.1'
    });

main_controller.get({ skip_ip: '10.10.10.1' }, function(request, response) {
    response.send('get handler');
});
main_controller.use(function(request, response) {
    response.send('use handler');
});
```

Test case:

    curl localhost:8080 -H x-forwarded-for=127.0.0.1 # status 401, Access denied for user's ip
    curl localhost:8080 -H x-forwarded-for=10.10.10.1 # status 200, use handler

## Real examples
* **[ifnode-auth](https://github.com/ifnode/auth)**
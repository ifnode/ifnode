var fns = require('./libs/fns'),
    app;

const METHODS = ['all', 'get', 'post', 'put', 'patch', 'delete'];

var check_method = function(method) {
    if(METHODS.indexOf(method) === -1) {
        throw new Error('Not supported method');
    }
};
var disassemble_raw_routes = function(raw_controller_routes) {
    var formed_routes = {};

    fns.each(raw_controller_routes, function(actions, route) {
        if( fns.is_string(actions) ) {
            actions = { "get": actions };
        }

        fns.each(actions, function(action_name, method) {
            method = method.toLowerCase();

            check_method(method);
            formed_routes[action_name] = {
                route: route,
                method: method,
                handler: action_name
            };
        });
    });

    return formed_routes;
};

var Routes = function(raw_controller_routes) {
    app = require('./application').server;
    return disassemble_raw_routes(raw_controller_routes);
};
Routes.add = function(params) {
    var controller = this;

    if(params.through) {
    }

    app[params.method](params.route,
        function(request, response, next) {
            request.controller = controller;
            next();
        },
        params.handler);
};

module.exports = Routes;
var _ = require('lodash');

module.exports = function(app, Controller) {
    var auth = app.auth.attach(app.server),
        user_role_field = auth.user_role_field,
        default_roles = auth.default_roles,

        auth_middleware;

    Controller.fn.roles = auth.roles;
    Controller.fn.default_role = default_roles.all;

    Controller.fn._default_config.access = [default_roles.all];
    Controller.fn._page_access_denied = function(request, response) {
        response.status(401).send('Unauthorized user');
    };

    Controller.process_config(function(controller_config) {
        var access_options = controller_config.access,
            only_options = controller_config.only,

            process = function(options, defualt) {
                if(!options) {
                    options = defualt;
                } else if(!Array.isArray(options)) {
                    options = [options];
                }

                return options;
            };

        controller_config.access = process(controller_config.access, [this.default_role]);
        controller_config.only =   process(controller_config.only, [this.default_role]);

        return controller_config;
    });

    auth_middleware = function(self, request, options, can_callback, cannot_callback, error_callback) {
        var is_authenticated = request.isAuthenticated(),
            get_role = function(callback) {
                var auth_get_role = auth.get_role,
                    user_role;

                if(typeof auth_get_role === 'function') {
                    return auth_get_role(request.user, callback);
                }

                if(user_role_field) {
                    user_role = request.user[user_role_field];

                    if(typeof user_role === 'function') {
                        user_role = user_role();
                    }
                } else {
                    user_role = default_roles.authenticated;
                }

                callback(null, user_role);
            };

        if(_.contains(options, self.default_role)) {
            return can_callback();
        }

        if(is_authenticated) {
            get_role(function(err, user_role) {
                if(err) { return error_callback(err); }

                if(
                    !_.contains(options, default_roles.authenticated) &&
                    !_.contains(options, user_role)
                ) {
                    return cannot_callback();
                }

                can_callback();
            });
            return;
        } else if(!_.contains(options, default_roles.guest)) {
            return cannot_callback();
        }

        can_callback();
    };

    Controller.populate(function() {
        var self = this;

        return function(request, response, next, next_router) {
            response.access_denied = response.accessDenied = function() {
                self._page_access_denied.call(self, request, response);
            };
            next();
        };
    });
    Controller.middleware([
        function only_middleware(options) {
            var self = this,
                roles = self.roles,
                only_options = options.only;

            return function only_middleware(request, response, next_handler, next_route) {
                auth_middleware(self, request, only_options,
                    next_handler,
                    next_route,
                    next_route
                );
            }
        },
        function access_middleware(options) {
            var self = this,
                roles = self.roles,
                access_options = options.access;

            return function access_middleware(request, response, next_handler, next_route) {
                var args = app.helper.to_array(arguments);

                auth_middleware(self, request, access_options,
                    next_handler,
                    function() {
                        self._page_access_denied.apply(self, args);
                    },
                    next_route
                );
            };
        }
    ]);

    Controller.fn.access_denied = Controller.fn.accessDenied = function(callback) {
        this._page_access_denied = callback;
        return this;
    };
};

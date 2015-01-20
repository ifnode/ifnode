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
        response.send(401, 'Unauthorized user');
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

    auth_middleware = function(self, request, options, can_callback, cannot_callback) {
        var is_authenticated = request.isAuthenticated(),
            user_role;

        if(_.contains(options, self.default_role)) {
            return can_callback();
        }

        if(is_authenticated) {
            user_role = request.user[user_role_field];

            if(typeof user_role === 'function') {
                user_role = user_role();
            }

            if(
                !_.contains(options, default_roles.authenticated) &&
                !_.contains(options, user_role)
            ) {
                return cannot_callback();
            }
        } else if(!_.contains(options, default_roles.guest)) {
            return cannot_callback();
        }

        can_callback();
    };

    Controller.middleware([
        function only_middleware(options) {
            var self = this,
                roles = self.roles,
                only_options = options.only;

            return function only_middleware(request, response, next_handler, next_route) {
                auth_middleware(self, request, only_options,
                    next_handler,
                    next_route
                );
            }
        },
        function access_middleware(options) {
            var self = this,
                roles = self.roles,
                access_options = options.access;

            return function access_middleware(request, response, next) {
                var args = app.helper.to_array(arguments);

                auth_middleware(self, request, access_options,
                    next,
                    function() {
                        self._page_access_denied.apply(self, args);
                    }
                );
            };
        }
    ]);

    Controller.fn.access_denied = Controller.fn.accessDenied = function(callback) {
        this._page_access_denied = callback;
        return this;
    };
};

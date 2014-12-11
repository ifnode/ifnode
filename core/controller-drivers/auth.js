var _ = require('lodash');

var attach_auth_to_app = function(app) {
    var app_server = app.server,
        auth = app.auth;

    auth.attach(app_server);
};

module.exports = function(app, Controller) {
    Controller.fn.roles = {
        all: '*',
        guest: '?',
        authenticated: '@'
    };
    Controller.fn.default_role = Controller.fn.roles.all;

    Controller.fn._default_config.access = [Controller.fn.roles.all];
    Controller.fn._page_access_denied = function(request, response) {
        response.send(403);
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
    Controller.middleware([
        function only_middleware(options) {
            var self = this,
                roles = self.roles,
                only_options = options.only;

            return function only_middleware(request, response, next_handler, next_route) {
                var is_authenticated = request.isAuthenticated(),
                    user_role;

                if(_.contains(only_options, self.default_role)) {
                    return next_handler();
                }

                if(is_authenticated) {
                    if(!_.contains(only_options, roles.authenticated)) {
                        console.log(self.name, only_options, roles.authenticated)
                        return next_route();
                    }
                } else if(!_.contains(only_options, roles.guest)) {
                    return next_route();
                }

                next_handler();
            }
        },
        function access_middleware(options) {
            var self = this,
                roles = self.roles,
                access = options.access,
                page_access_denied = self._page_access_denied;

            return function access_middleware(request, response, next) {
                if(!_.contains(access, roles.all)) {
                    var is_authenticated = request.isAuthenticated();
                    console.log('access: %s, auth: %s', access, is_authenticated);

                    if(is_authenticated) {
                        // TODO: add possibity for set own user roles
                        var userType = request.user.userType;
                        if(!(_.contains(access, roles.authenticated) || _.contains(access, userType))) {
                            return page_access_denied.apply(self, arguments);
                        }
                    } else if(!_.contains(access, roles.guest)) {
                        return page_access_denied.apply(self, arguments);
                    }
                }

                next();
            };
        }
    ]);

    Controller.fn.access_denied = Controller.fn.accessDenied = function(callback) {
        this._page_access_denied = callback;
        return this;
    };

    attach_auth_to_app(app);
};

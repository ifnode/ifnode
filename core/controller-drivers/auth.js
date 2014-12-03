module.exports = function(app, Controller) {
    Controller.fn.roles = {
        all: '*',
        guest: '?',
        authenticated: '@'
    };
    Controller.fn.is_access_options = function(roles) {
//  if(_.isUndefined(roles)) {
//    return false;
//  }
//
//  if(!_.isArray(roles)) {
//    throw new Error('Access roles wrong type. Must be array');
//  }
//
//  roles.forEach(function(role) {
//    if(!_.isString(role)) {
//      throw new Error('One of access role wrong type: %s. Must be string', JSON.stringify(role));
//    }
//
//    // TODO: need form list of roles
////    if(!_.contains(this._roles._list, role)) {
////      throw new Error('Unknow role: %s. Must be one of list: %s', options.access, this._roles._list);
////    }
//  });
//
//  return true;
        return _.isArray(roles);
    };
    Controller.fn._default_config.access = [Controller.fn._roles.all];
    Controller.fn._page_access_denied = function(request, response, next) {
        response.fail('permissionDenied');
    };

    Controller.process_config(function(controller_config) {
        if(this.is_access_options(controller_config.access)) {
            if(!_.contains(controller_config.access, this._roles.admin)) {
                controller_config.access.push(this._roles.admin);
            }
        } else {
            controller_config.access = [this._roles.all];
        }

        return controller_config;
    });
    Controller.middleware([
        function only_middleware(options) {
            var self = this;

            // TODO: create method skip all handlers
            self.skip_all();
        },
        function access_middleware(options) {
            var self = this,
                roles = self.roles,
                access;

            return function(request, response, next) {
                if(self.is_access_options(options.access)) {
                    access = options.access;
                }

                if(!_.contains(access, roles.all)) {
                    var is_authenticated = request.isAuthenticated();
                    //console.log('access: %s, auth: %s', access, is_authenticated);

                    if(is_authenticated) {
                        var userType = request.user.userType;
                        if(!(_.contains(access, roles.authenticated) || _.contains(access, userType))) {
                            return self._page_access_denied.apply(self, arguments);
                        }
                    } else if(!_.contains(access, roles.guest)) {
                        return self._page_access_denied.apply(self, arguments);
                        //return self._page_not_found.apply(self, arguments);
                    }
                }
            };
        }
    ]);

    Controller.fn.access_denied = Controller.fn.accessDenied = function(callback) {
        this._page_access_denied = callback;
        return this;
    };
};

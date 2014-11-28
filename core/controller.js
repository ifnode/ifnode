var helper = require('./helper'),

    _ = require('underscore'),
    express = require('express');

var Controller = function(config) {
    if(!(this instanceof Controller)) {
        return new Controller(config);
    }
    this.init(config);
};

Controller.fn = Controller.prototype;
Controller.fn._roles = {
    all: '*',
    guest: '?',
    authenticated: '@',

    // TODO
    admin: 'administrator'
};
Controller.fn.is_url = function(url) {
    if(_.isUndefined(url)) {
        return false;
    }
    if(!_.isString(url)) {
        throw new Error('Url wrong type. Must be string');
    }
    return true;
};
Controller.fn._is_options = Controller.fn._is_config = function(obj) {
//  if(_.isUndefined(obj)) {
//    return false;
//  }
//
//  if(!helper.is_plain_object(obj)) {
//    throw new Error('Access option wrong type. Must be object');
//  }
//
//  return true;
    return helper.is_plain_object(obj);
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
Controller.fn.is_callback = function(callback) {
//  if(!_.isFunction(callback)) {
//    throw new Error('Callback wrong type. Must be only function');
//  }
//
//  return true;
    return _.isFunction(callback);
};
Controller.fn._default_config = {
    root: '/',
    //ajax: ,
    access: [Controller.fn._roles.all]
};
Controller.fn._page_only_ajax = function(request, response, next) {
    response.fail('ajaxRequestOnly');
//  response.send(400, 'only ajax request');
};
Controller.fn._page_without_ajax = function(request, response, next) {
    response.fail('ajaxRequestDenied');
//  response.send(400, 'without ajax request');
};
Controller.fn._page_access_denied = function(request, response, next) {
    response.fail('permissionDenied');
};
Controller.fn._page_not_found = function(request, response, next) {
    response.fail('notFound');
//  response.fail('pageNotFound');
};

Controller.fn._process_config = function(controller_config) {
    if(!this._is_config(controller_config)) {
        return this._default_config;
    }

    controller_config.root = this.is_url(controller_config.root) ?
        controller_config.root :
        this._default_config.root;

    controller_config.access = this.is_access_options(controller_config.access)?
        controller_config.access :
        this._default_config.access;

    if(this.is_access_options(controller_config.access)) {
        if(!_.contains(controller_config.access, this._roles.admin)) {
            controller_config.access.push(this._roles.admin);
        }
    } else {
        controller_config.access = [this._roles.all];
    }
    
    return controller_config;
};

Controller.fn.init = function(config) {
    this._config = this._process_config(config);
    this._router = express.Router();

    this.id = helper.uid();
    this.name = this._config.name || this.id;
    this._root = this._config.root;
    this._common_options = _.pick(this._config, ['ajax', 'access']);
};

// TODO: make method who init all custom middleware
Controller.fn._middleware_extend_response = function(options) {
    var self = this;
    
    return function(request, response, next) {
        response.page_not_found = response.pageNotFound = function() {
            self._page_not_found(request, response, next);
        };
        next();
    };
};

Controller.fn._middleware = function(options) {
    var self = this,
        roles = self._roles,
        both_request_types = true,
        only_ajax, without_ajax,
        access;

    if(_.isBoolean(options.ajax)) {
        both_request_types = false;
        only_ajax = options.ajax;
        without_ajax = !options.ajax;
    }

    if(this.is_access_options(options.access)) {
        access = options.access;
    } else {
        access = [roles.admin];
    }

    return function(request, response, next) {
        if(!both_request_types) {
            if(only_ajax && !request.xhr) {
                return self._page_only_ajax.apply(self, arguments);
            }
            if(without_ajax && request.xhr) {
                return self._page_without_ajax.apply(self, arguments);
            }
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

        next();
    };
};

Controller.fn._regulize_route_params = function(args) {
    var url, options, callbacks;

    if(this.is_callback(args[0])) {
        url = '/';
        options = _.clone(this._common_options);
        callbacks = args;
    } else if(this._is_options(args[0])) {
        url = '/';
        options = _.extend(_.clone(this._common_options), args[0]);
        callbacks = args.slice(1);
    } else {
        url = args[0];
        if(this._is_options(args[1])) {
            options = _.extend(_.clone(this._common_options), args[1]);
            callbacks = args.slice(2);
        } else {
            options = _.clone(this._common_options);
            callbacks = args.slice(1);
        }
    }

    return [url, options, callbacks];
};
Controller.fn._generate_url = function(method) {
    var args = helper.to_array(arguments, 1),
        params = this._regulize_route_params(args),

        url = params[0],
        options = params[1],
        before_callbacks = this._common_options.before || [],
        user_callbacks = params[2],
        callbacks = [];

    console.log('method: %s, root: %s, url: %s, options: %s', method, this._root, url, options, user_callbacks);

    for(var i = user_callbacks.length; i--; ) {
        user_callbacks[i] = user_callbacks[i].bind(this);
    }

    var skipper = function(callback) {
        return function(req, res, next) {
            console.log('*skipper*');
            if(req.skip) {
                return next();
            }
            callback(req, res, next);
        }
    };

    var self = this;
    callbacks = callbacks
        .concat(before_callbacks)
        .concat([
            skipper(this._middleware_extend_response()),
            skipper(this._middleware(options))
        ])
        .concat(user_callbacks);

    this._router[method].apply(this._router, [url].concat(callbacks));
    //this._router[method](url, function(req, res, next) {
    //    callbacks.forEach(function(callback) {
    //        callback(req, res, next);
    //    })
    //});
};

Controller.fn.method = function(methods/*, url, options, callbacks */) {
    var self = this,
        args = helper.to_array(arguments, 1);

    if(!Array.isArray(methods)) {
        methods = [methods];
    }

    methods.forEach(function(method) {
        self._generate_url.apply(self, [method].concat(args));
    });

    return this;
};

[
    { method: 'get'   , alias: ['get'] },
    { method: 'post'  , alias: ['post'] },
    { method: 'put'   , alias: ['put'] },
    { method: 'patch' , alias: ['patch'] },
    { method: 'delete', alias: ['delete', 'del'] }
].forEach(function(data) {
    var to_array = helper.to_array,
        make_sugar = function(method) {
            return function() {
                this.method.apply(this, [method].concat(to_array(arguments)));
                return this;
            };
        };

    data.alias.forEach(function(alias) {
        Controller.fn[alias] = make_sugar(data.method);
    });
});

Controller.fn.end = function() {
    this.use(this._page_not_found.bind(this));
    return this;
};
Controller.fn.use = function(callbacks) {
    callbacks = helper.to_array(arguments);
    this._router.use.apply(this._router, callbacks);
    return this;
};

//Controller.fn.to = function(controller) {
//};

Controller.fn.before = function(callbacks) {
    callbacks = helper.to_array(arguments);
    this._common_options.through = callbacks;
};
Controller.fn.access_denied = Controller.fn.accessDenied = function(callback) {
    this._page_access_denied = callback;
    return this;
};

Controller.fn.__defineGetter__('root', function() { return this._root; });
Controller.fn.__defineGetter__('router', function() { return this._router; });

module.exports = Controller;

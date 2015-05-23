'use strict';

var debug = require('debug')('ifnode:controller'),
    helper = require('./helper'),
    log = require('./extensions/log'),

    _ = require('lodash'),
    async = require('async'),
    express = require('express'),

    add_functions = function(list, fns) {
        if(!Array.isArray(fns)) {
            fns = [fns];
        }

        [].push.apply(list, fns);
    },

    _process_config = function(controller_config) {
        var self = this;

        if(!_.isPlainObject(controller_config)) {
            controller_config = {};
        }

        this._config_processors.forEach(function(processor) {
            controller_config = processor.call(self, controller_config);
        });

        return controller_config;
    },
    _regulize_route_params = function(args) {
        var url, options, callbacks;

        if(_.isFunction(args[0])) {
            url = '/';
            options = _.clone(this._common_options);
            callbacks = args;
        } else if(_.isPlainObject(args[0])) {
            url = '/';
            options = _.extend(_.clone(this._common_options), args[0]);
            callbacks = args.slice(1);
        } else {
            url = args[0];
            if(_.isPlainObject(args[1])) {
                options = _.extend(_.clone(this._common_options), args[1]);
                callbacks = args.slice(2);
            } else {
                options = _.clone(this._common_options);
                callbacks = args.slice(1);
            }
        }

        return [url, options, callbacks];
    },
    _generate_url = function(method) {
        var args = helper.to_array(arguments, 1),
            params = _regulize_route_params.call(this, args),

            url = params[0],
            options = params[1],
            before_callbacks = this._common_options.before || [],
            user_callbacks = params[2],
            callbacks = [],

            i, len;

        debug(
            log.form('%-7s Access: %-7s Only: %-7s %s',
                method.toUpperCase(),
                options.access,
                options.only,
                (this.root + url).replace(/\/+/g, '/')
            )
        );

        for(i = 0, len = user_callbacks.length; i < len; ++i) {
            user_callbacks[i] = user_callbacks[i].bind(this);
        }

        for(i = 0, len = this._populates.length; i < len; ++i) {
            callbacks.push(this._populates[i].call(this));
        }
        for(i = 0, len = this._middlewares.length; i < len; ++i) {
            callbacks.push(this._middlewares[i].call(this, options));
        }

        callbacks = callbacks
            .concat(before_callbacks)
            .concat(user_callbacks);

        this._router[method](url, function(request, response, next_route) {
            async.eachSeries(callbacks, function(callback, next_callback) {
                var next_handler = function(options) {
                    var is_error = options instanceof Error;

                    if(is_error) {
                        return next_route(options);
                    }

                    next_callback();
                };

                callback(request, response, next_handler, next_route);
            });
        });
    },

    _initialize = function(controller_config) {
        var config = _process_config.call(this, controller_config);

        this.id = helper.uid();
        this.name = config.name;
        this.root = helper.add_end_slash(config.root);

        this._router = express.Router(config.router);
        this._common_options = {
            root: this.root,
            name: this.name
        };
    };

var Controller = function(config) {
    if(!(this instanceof Controller)) {
        return new Controller(config);
    }

    _initialize.call(this, config);
};

Controller.fn = Controller.prototype;

Controller.fn._config_processors = [];
Controller.fn._populates = [];
Controller.fn._middlewares = [];

Controller.process_config = function(processor) {
    add_functions(Controller.fn._config_processors, processor);
};
Controller.populate = function(fns) {
    add_functions(Controller.fn._populates, fns);
};
Controller.middleware = function(fns) {
    add_functions(Controller.fn._middlewares, fns);
};

Controller.middleware([
    function ajax_middleware(options) {
        var both_request_types = true,
            only_ajax, without_ajax;

        if (typeof options.ajax === 'boolean') {
            both_request_types = false;
            only_ajax = options.ajax;
            without_ajax = !options.ajax;
        }

        return function ajax_middleware(request, response, next) {
            if (!both_request_types) {
                if (only_ajax && !request.xhr) {
                    return response.bad_request('Only AJAX request');
                }
                if (without_ajax && request.xhr) {
                    return response.bad_request('AJAX request is denied');
                }
            }

            next();
        }
    }
]);

Controller.fn.param = function(name, expression) {
    if(typeof name !== 'string') {
        log.error('controllers', 'Param name must be String');
    }
    if(typeof expression !== 'function') {
        log.error('controllers', 'Param name must be Function');
    }

    this._router.param.call(this._router, name, expression);
};

Controller.fn.method = function(methods/*, url, options, callbacks */) {
    var self = this,
        args = helper.to_array(arguments, 1);

    if(!Array.isArray(methods)) {
        methods = [methods];
    }

    methods.forEach(function(method) {
        _generate_url.apply(self, [method].concat(args));
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
                return this.method.apply(this, [method].concat(to_array(arguments)));
            };
        };

    data.alias.forEach(function(alias) {
        Controller.fn[alias] = make_sugar(data.method);
    });
});

//Controller.fn.route = function(route, options) {
//    var self = this,
//        route_arguments = _regulize_route_params.call(this, helper.to_array(arguments, 0));
//
//    var route_methods = {
//        'get': function(/* callbacks */) {
//            var _args = [].push.apply(route_arguments.slice(0, 2), helper.to_array(arguments));
//
//            self.get.apply(self, _args);
//
//            return route_methods;
//        }
//    };
//
//    return route_methods;
//};

Controller.fn.error = function(custom_error_handler) {
    var self = this;

    this.error_handler = custom_error_handler;
    this.use(function(err, request, response, next) {
        custom_error_handler.apply(self, arguments);
    });

    return this;
};
Controller.fn.end = function() {
    this.use(function(request, response) {
        response.not_found();
    });
    return this;
};
Controller.fn.use = function(routes, callbacks) {
    this._router.use.apply(this._router, arguments);
    return this;
};

//Controller.fn.action = function(action_name, handler) {
//    if(typeof handler === 'function') {
//        if(action_name in this._actions) {
//            console.warn('Action %s already exist', handler);
//        } else {
//            this._actions[action_name] = this[action_name] = handler.bind(this);
//        }
//    }
//
//    return this._actions[action_name];
//};

helper.define_properties(Controller.fn, {
    'router': function() { return this._router }
});

module.exports = Controller;

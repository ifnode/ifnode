var helper = require('./helper'),
    log = require('./extensions/log'),

    _ = require('lodash'),
    async = require('async'),
    express = require('express'),

    add_fn = function(list, fns) {
        if(!Array.isArray(fns)) {
            fns = [fns];
        }

        fns.forEach(function(fn) {
            if(typeof fn === 'function') {
                list.push(fn);
            } else {
                console.warn('Not a function: ', fn);
            }
        });
    };

var Controller = function(config) {
    if(!(this instanceof Controller)) {
        return new Controller(config);
    }
    this.init(config);
};

Controller.fn = Controller.prototype;

Controller.fn._default_config = {
    root: '/'
    //ajax: ,
};
Controller.fn._config_processors = [];
Controller.fn._populates = [];
Controller.fn._middlewares = [];

Controller.process_config = function(processor) {
    this.fn._config_processors.push(processor);
};

Controller.populate = function(fns) {
    add_fn(Controller.fn._populates, fns);
};
Controller.middleware = function(fns) {
    add_fn(Controller.fn._middlewares, fns);
};

Controller.fn._page_only_ajax = function(request, response, next) {
    response.status(400).send('Only AJAX');
};
Controller.fn._page_without_ajax = function(request, response, next) {
    response.status(400).send('AJAX is denied');
};
Controller.fn._page_not_found = function(request, response, next) {
    response.status(404).send('Page not Found');
};

Controller.fn._process_config = function(controller_config) {
    var self = this;

    if(!_.isPlainObject(controller_config)) {
        controller_config = this._default_config;
    }

    controller_config.root = _.isString(controller_config.root) ?
        controller_config.root :
        this._default_config.root;

    this._config_processors.forEach(function(processor) {
        controller_config = processor.call(self, controller_config);
    });

    return controller_config;
};

Controller.fn.init = function(config) {
    this._config = this._process_config(config);
    this._router = express.Router();

    this.id = helper.uid();
    this.name = this._config.name || this.id;
    this._root = this._config.root;

    this._actions = {};
    this._common_options = _.omit(this._config, [
        'name',
        'root'
    ]);
};

// TODO: make method who init all custom middleware
Controller.middleware([
    function add_special_function(options) {
        var self = this;

        return function add_special_function(request, response, next) {
            response.page_not_found = response.pageNotFound = function() {
                self._page_not_found(request, response, next);
            };
            next();
        };
    },
    function ajax_middleware(options) {
        var self = this,
            both_request_types = true,
            only_ajax, without_ajax;

        if (_.isBoolean(options.ajax)) {
            both_request_types = false;
            only_ajax = options.ajax;
            without_ajax = !options.ajax;
        }

        return function ajax_middleware(request, response, next) {
            if (!both_request_types) {
                if (only_ajax && !request.xhr) {
                    return self._page_only_ajax.apply(self, arguments);
                }
                if (without_ajax && request.xhr) {
                    return self._page_without_ajax.apply(self, arguments);
                }
            }

            next();
        }
    }
]);

Controller.fn._regulize_route_params = function(args) {
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
};
Controller.fn._generate_url = function(method) {
    var args = helper.to_array(arguments, 1),
        params = this._regulize_route_params(args),

        url = params[0],
        options = params[1],
        before_callbacks = this._common_options.before || [],
        user_callbacks = params[2],
        callbacks = [],

        i, len;

    log.console('%-7s Access: %-7s Only: %-7s %s',
        method.toUpperCase(),
        options.access,
        options.only,
        (this._root + url).replace(/\/+/g, '/'));

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

Controller.fn.error_handler = function(err, request, response, next) {
    log.console('[ifnode] [controller] Default error handler');
    next(err);
};
Controller.fn.error = function(custom_error_handler) {
    var self = this,
        handler = typeof custom_error_handler === 'function'?
            custom_error_handler :
            this.error_handler;

    this.error_handler = function(err, request, response, next) {
        handler.apply(self, arguments);
    };

    this._router.use(this.error_handler.bind(this));

    return this;
};

Controller.fn.end = function() {
    this.use(this._page_not_found.bind(this));
    return this;
};
Controller.fn.use = function(callbacks) {
    callbacks = helper.to_array(arguments);
    this._router.use.apply(this._router, callbacks);
    return this;
};

Controller.fn.action = function(action_name, handler) {
    if(typeof handler === 'function') {
        if(action_name in this._actions) {
            console.warn('Action %s already exist', handler);
        } else {
            this._actions[action_name] = this[action_name] = handler.bind(this);
        }
    }

    return this._actions[action_name];
};

helper.define_properties(Controller.fn, {
    'root': function() { return this._root },
    'router': function() { return this._router }
});

module.exports = Controller;

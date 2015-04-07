var _ = require('lodash'),

    intersection = function() {
        var args = [].slice.call(arguments),
            intersected = [];

        args[0].forEach(function(name) {
            if(name in args[1]) {
                intersected.push(name);
            }
        });

        return intersected;
    },

    request_populate = function(request) {
        if(request.method === 'GET') {
            request.data = request.query;
        } else {
            request.data = request.body;
        }

        if(
            Object.prototype.toString.call(request.data) === '[object Object]' &&
            !Object.keys(request.data).length
        ) {
            request.data = null;
        }
    },
    response_populate = function(response) {
        var send = function(options) {
            if(options.code) {
                response.status(options.code);
            }

            response.send(options.resp);
        };

        response.ok = function(data) {
            send({
                resp: data
            });
        };
        response.fail = function() {
            send({
                code: 400,
                resp: 'Bad Request'
            });
        };
        response.err = response.error = function() {
            send({
                code: 500,
                resp: 'Server Internal Error'
            });
        };

        response.forbidden = function(data) {
            send({
                code: 403,
                resp: data
            });
        };
        response.not_found = response.notFound = function(data) {
            send({
                code: 404,
                resp: data
            });
        };
    },

    populate = function(options, next) {
        var populated_object = options.populated_object,
            rewrited = intersection(options.list, populated_object),
            error = null;

        if(!rewrited.length) {
            options.populate_function(populated_object);
        } else {
            error = new Error(_.template('Some module rewrite response. <%= type %>: <%= keys %>.')({
                type: options.type,
                keys: rewrited
            }));
        }

        next(error);
    },

    middleware = function(callback) {
        return function(options) {
            return callback;
        };
    };

module.exports = {
    request: middleware(function(request, response, next) {
        populate({
            type: 'Request',
            populated_object: request,
            list: [
                'data'
            ],
            populate_function: request_populate
        }, next);
    }),
    response: middleware(function(request, response, next) {
        populate({
            type: 'Response',
            populated_object: response,
            list: [
                'ok',
                'fail',
                'err', 'error',

                'forbidden',
                'not_found', 'notFound'
            ],
            populate_function: response_populate
        }, next);
    })
};

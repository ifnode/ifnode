var _ = require('lodash'),

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
        response.fail = function(key) {
            send({ resp: {
                status: 'fail',
                data: key
            } });
        };
        response.err = response.error = function(err) {
            console.log(err);

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

    REST;

REST = function(request, response, next) {
    var intersection = function() {
            var args = [].slice.call(arguments),
                intersected = [];

            args[0].forEach(function(name) {
                if(name in args[1]) {
                    intersected.push(name);
                }
            });

            return intersected;
        },

        request_populate_list = [
            'data'
        ],
        rewrited_request_keys = intersection(request_populate_list, request),

        response_populate_list = [
            'ok',
            'fail',
            'err', 'error',

            'forbidden',
            'not_found', 'notFound'
        ],
        rewrited_response_keys = intersection(response_populate_list, response);

    if(!rewrited_request_keys.length && !rewrited_response_keys.length) {
        request_populate(request);
        response_populate(response);
    } else {
        throw _.template('Some module rewrite response. Request: <%= req_keys %>. Response: <%= res_keys %>')({
            req_keys: rewrited_request_keys,
            res_keys: rewrited_response_keys
        });
    }

    next();
};

module.exports = function() {
    return REST
};

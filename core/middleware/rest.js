'use strict';

var _isPlainObject = require('lodash/isPlainObject');

/**
 *
 * @param   {Array}     list
 * @param   {Object}    object
 * @returns {Array.<string>}
 */
function intersection(list, object) {
    var intersected = [];

    list.forEach(function(name) {
        if(name in object) {
            intersected.push(name);
        }
    });

    return intersected;
}

/**
 *
 * @param {IncomingMessage} request
 */
function request_populate(request) {
    if(request.method === 'GET') {
        request.data = request.query;
    } else {
        request.data = request.body;
    }

    if(
        _isPlainObject(request.data) &&
        !Object.keys(request.data).length
    ) {
        request.data = null;
    }
}

/**
 *
 * @param {ServerResponse}  response
 */
function response_populate(response) {
    /**
     * @typedef {Buffer|Array|String|Object} IFResponseData
     */

    /**
     *
     * @param {number}          code
     * @param {IFResponseData}  [data]
     */
    function send(code, data) {
        if(!data) {
            response.sendStatus(code);
        } else {
            response.status(code).send(data);
        }
    }

    /**
     *
     * @param {IFResponseData}  [data]
     */
    response.ok = function ok(data) {
        send(200, data);
    };

    /**
     *
     * @param {IFResponseData}  [data]
     */
    response.fail = function fail(data) {
        send(400, data || 'Bad Request');
    };
    response.bad_request = response.badRequest = response.fail;

    /**
     *
     * @param {IFResponseData}  [data]
     */
    response.unauthorized = function unauthorized(data) {
        send(401, data);
    };

    /**
     *
     * @param {IFResponseData}  [data]
     */
    response.forbidden = function forbidden(data) {
        send(403, data);
    };

    /**
     *
     * @param {IFResponseData}  [data]
     */
    response.not_found = response.notFound = function not_found(data) {
        send(404, data);
    };

    /**
     *
     * @param {IFResponseData}  [data]
     */
    response.err = response.error = function error(data) {
        send(500, data || 'Server Internal Error');
    };
}

/**
 *
 * @param {Object}      options
 * @param {function}    next
 */
function populate(options, next) {
    var populated_object = options.populated_object;
    var rewrited = intersection(options.list, populated_object);
    var error = null;

    if(!rewrited.length) {
        options.populate_function(populated_object);
    } else {
        error = new Error('Some module rewrite response. ' + options.type + ': ' + rewrited + '.');
    }

    next(error);
}

/**
 *
 * @param   {function}  callback
 * @returns {Function}
 */
function middleware(callback) {
    return function() {
        return callback;
    };
}

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

                'bad_request', 'badRequest',
                'unauthorized',
                'forbidden',
                'not_found', 'notFound'
            ],
            populate_function: response_populate
        }, next);
    })
};

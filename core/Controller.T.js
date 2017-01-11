/**
 * @typedef {Object} ControllerOptions
 *
 * @property {string}                   [root]
 * @property {string}                   [name]
 * @property {Object}                   [router]
 * @property {boolean}                  [ajax]
 * @property {Object}                   [map]
 * @property {ControllerBeforeCallback} [before]
 */



/**
 * @typedef {string|routeHandler}   ControllerBeforeCallback
 */



/**
 * @callback errorHandler
 * @param {Error}           error
 * @param {IFRequest}       request
 * @param {IFResponse}      response
 * @param {function}        next
 */

/**
 * @callback routeHandler
 * @param {IFRequest}       request
 * @param {IFResponse}      response
 * @param {function}        next
 */

/**
 * @typedef {T_IFRequest|IncomingMessage} IFRequest
 */
/**
 * @typedef {T_IFResponse|ServerResponse} IFResponse
 */

/**
 * @typedef {Object} T_IFRequest
 *
 * @property    {Object}    params
 * @property    {?Object}   data
 */

/**
 * @callback request_ok
 * @param   {Buffer|Array|String|Object}  [data]      Set status 200 and return data
 */
/**
 * @callback request_fail
 * @param   {Buffer|Array|String|Object}  [data]      Set status 400 and return data
 */
/**
 * @callback request_error
 * @param   {Buffer|Array|String|Object}  [data]      Set status 500 and return data
 */
/**
 * @callback request_unauthorized
 * @param   {Buffer|Array|String|Object}  [data]      Set status 401 and return data
 */
/**
 * @callback request_forbidden
 * @param   {Buffer|Array|String|Object}  [data]      Set status 403 and return data
 */
/**
 * @callback request_not_found
 * @param   {Buffer|Array|String|Object}  [data]      Set status 404 and return data
 */

/**
 * @typedef {Object} T_IFResponse
 *
 * @property    {request_ok}            ok
 * @property    {request_fail}          fail
 * @property    {request_fail}          bad_request
 * @property    {request_fail}          badRequest
 * @property    {request_error}         error
 * @property    {request_error}         err
 * @property    {request_unauthorized}  unauthorized
 * @property    {request_forbidden}     forbidden
 * @property    {request_not_found}     not_found
 * @property    {request_not_found}     notFound
 */

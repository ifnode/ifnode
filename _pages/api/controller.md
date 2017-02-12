# Controller

## Description

`ifnode` have possibility to build own web-API interfaces.

Controller can be extended by external plugins (example: `ifnode-auth`, `ifnode-permissions` etc)

## Definition

### JSDoc syntax

```javascript
/**
 * @typedef {Express.Request} IFRequest
 * 
 * @property {?Object}  data
 */


/**
 * @typedef {Buffer|Array|String|Object} IFResponseData
 */

/**
 * @callback request_ok
 * @param {IFResponseData}  [data]
 */
/**
 * @callback request_fail
 * @param {IFResponseData}  [data]
 */
/**
 * @callback request_error
 * @param {IFResponseData}  [data]
 */
/**
 * @callback request_unauthorized
 * @param {IFResponseData}  [data]
 */
/**
 * @callback request_forbidden
 * @param {IFResponseData}  [data]
 */
/**
 * @callback request_not_found
 * @param {IFResponseData}  [data]
 */

/**
 * @typedef {Express.Response} IFResponse
 * 
 * @property    {request_ok}            ok
 * @property    {request_fail}          fail
 * @property    {request_fail}          bad_request
 * @property    {request_fail}          badRequest
 * @property    {request_unauthorized}  unauthorized
 * @property    {request_forbidden}     forbidden
 * @property    {request_not_found}     not_found
 * @property    {request_not_found}     notFound
 * @property    {request_error}         error
 * @property    {request_error}         err
 */

/**
 * @callback nextHandler
 * @param {Error}    [error]
 */

/**
 * @callback routeHandler
 * 
 * @param {IFRequset}    request
 * @param {IFResponse}   response
 * @param {nextHandler}  next_handler
 * @param {nextHandler}  next_route
 */

/**
 * @callback errorHandler
 * 
 * @param {Error}        error
 * @param {IFRequset}    request
 * @param {IFResponse}   response
 * @param {nextHandler}  next_handler
 * @param {nextHandler}  next_route
 */

/**
 * @typedef {Object} ControllerOptions
 * 
 * @property {string}   [root]
 * @property {string}   [name]
 * @property {Object}   [router]
 * @property {boolean}  [ajax]
 * @property {Object}   [map]
 */

/**
 * @interface Controller
 */

/**
 * @function Controller#constructor
 * 
 * @param {ControllerOptions}   [options]
 */

/**
 * @function Controller#before
 * 
 * @param {...routeHandler} callbacks
 */

/**
 * @function Controller#param
 * 
 * @param {string}      name
 * @param {function}    expression
 */

/**
 * @function Controller#method
 * 
 * @param   {string|Array.<string>} methods
 * @param   {string}                [path]
 * @param   {Object}                [options]
 * @param   {...routeHandler}       callbacks
 * @returns {Controller}
 */

/**
 * @function Controller#get
 * 
 * @param   {string}            [path]
 * @param   {Object}            [options]
 * @param   {...routeHandler}   callbacks
 * @returns {Controller}
 */

/**
 * @function Controller#post
 * 
 * @param   {string}            [path]
 * @param   {Object}            [options]
 * @param   {...routeHandler}   callbacks
 * @returns {Controller}
 */

/**
 * @function Controller#put
 * 
 * @param   {string}            [path]
 * @param   {Object}            [options]
 * @param   {...routeHandler}   callbacks
 * @returns {Controller}
 */

/**
 * @function Controller#patch
 * 
 * @param   {string}            [path]
 * @param   {Object}            [options]
 * @param   {...routeHandler}   callbacks
 * @returns {Controller}
 */

/**
 * @function Controller#delete
 * 
 * @param   {string}            [path]
 * @param   {Object}            [options]
 * @param   {...routeHandler}   callbacks
 * @returns {Controller}
 */

/**
 * @function Controller#del
 * 
 * @param   {string}            [path]
 * @param   {Object}            [options]
 * @param   {...routeHandler}   callbacks
 * @returns {Controller}
 */

/**
 * @function Controller#error
 * 
 * @param   {errorHandler}  custom_error_handler
 * @returns {Controller}
 */

/**
 * @function Controller#use
 * 
 * @returns {Controller}
 */

/**
 * @function Controller#use
 * 
 * @param   {...routeHandler}   callbacks
 * @returns {Controller}
 */

/**
 * @function Controller#compile
 */
```

### TypeScript syntax

```typescript
interface IFRequest extends Express.Request {
    data: Object|null
}

type IFResponseData = Buffer|Array|String|Object;

interface IFResponse extends Express.Response {
    ok(data?: IFResponseData),
    bad_request(data?: IFResponseData),
    badRequest(data?: IFResponseData),
    fail(data?: IFResponseData),
    unauthorized(data?: IFResponseData),
    forbidden(data?: IFResponseData),
    not_found(data?: IFResponseData),
    notFound(data?: IFResponseData)
    error(data?: IFResponseData),
    err(data?: IFResponseData)
}

interface nextHandler {
    (error?: Error)
}

interface routeHandler {
    (request: IFRequest, response: IFResponse, next_handler: nextHandler, next_route: nextHandler)
}

interface errorHandler {
    (error: Error, request: IFRequest, response: IFResponse, next_handler: nextHandler, next_route: nextHandler)
}

interface ControllerOptions {
    root?: string,
    name?: string,
    router?: Object,
    ajax?: boolean,
    map?: Object
}

type URLPath = string|RegExp|Array<string|RegExp>

interface Controller {
    id: string,
    name: string,
    root: string,
    router: Express.Router,
    map?: Object,
    new (options?: ControllerOptions),
    before(...callbacks: Array<routeHandler>),
    param(name: string, expression: Function),
    method(methods: string|Array<string>, path?: URLPath, options?: Object, ...callbacks: Array<routeHandler>): Controller,
    get(path?: URLPath, options?: Object, ...callbacks: Array<routeHandler>): Controller,
    post(path?: URLPath, options?: Object, ...callbacks: Array<routeHandler>): Controller,
    put(path?: URLPath, options?: Object, ...callbacks: Array<routeHandler>): Controller,
    patch(path?: URLPath, options?: Object, ...callbacks: Array<routeHandler>): Controller,
    delete(path?: URLPath, options?: Object, ...callbacks: Array<routeHandler>): Controller,
    del(path?: URLPath, options?: Object, ...callbacks: Array<routeHandler>): Controller,
    use(path?: URLPath, ...callbacks: Array<routeHandler>): Controller,
    end(): Controller,
    error(custom_error_handler: errorHandler): Controller,
    compile()
}
```

## Static methods

Static methods of `Controller` can be useful for creating controller's plugin. Example of static methods usage you can find __[here](/docs/app/plugins/controller)__.

### Controller.process_config( processors )

| Name | Type | Description |
| ---- | ---- | ----------- |
| `processors` | `function`, `Array<function>` | Adding special processor for initializing of controller's options

___Alias: [Controller.processConfig](/api/controller#process_config)___

### Controller.populate( populators )

| Name | Type | Description |
| ---- | ---- | ----------- |
| `populators` | `routeHandler`, `Array<routeHandler>` | Adding special middleware for populating by own properties and methods of `request`/`response`

### Controller.middleware( middlewares )

| Name | Type | Description |
| ---- | ---- | ----------- |
| `middlewares` | `routeHandler`, `Array<routeHandler>` | Adding special middleware for process request

## Controller#constructor( [options] )

### Arguments

| Name | Type | Description |
| ---- | ---- | ----------- |
| options | [`ControllerOptions`](https://github.com/ifnode/ifnode/blob/master/core/Controller.T.js#L2) | Options definition for controller. Below `ControllerOptions` are described more detailed

#### options

| Name | Type | Description |
| ---- | ---- | ----------- |
| root | `string` | Root path of the controller handling (for example, `/api/v1/users`) |
| name | `string` | Controller's name `path/to/controller` related `${backend_folder}` |
| router | `Object` | Options for initializing of `Express.Router` (check [here](https://expressjs.com/4x/api.html#router) list of possible options) |
| ajax | `boolean` | Configure accessibility of controller for AJAX, non-AJAX or both types of requests |
| map | `Object` | Hash of controllers actions. It contains key with method/path and value with action (read more about `map` **[here](/docs/app/controller#definition-by-map)**)

___Note: all options are optional___

## Instance properties

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| <code id="controller-id">id</code> | `string` | [UUID v4](https://github.com/kelektiv/node-uuid#uuidv4options--buffer--offset) | Unique value for each `Controller` instance |
| <code id="controller-name">name</code> | `string` | `/path/to/controller/` relative to [`app.backend_folder`](/api/application#application-backend_folder) | Controller's name. This name will used by framework when controller will be attached to `Application` instance (read more about controllers initializing **[here](/docs/app/controllers#initializing)**) |
| <code id="controller-root">root</code> | `string` | `/path/to/controller/` relative to [`app.backend_folder`](/api/application#application-backend_folder) | Controller root requests path. This path is a start point for all defined controllers handlers by `method` function. `root` will be concatenated with `method`'s path |
| <code id="controller-router">router</code> | `Express.Router` | `{}` | Router is base of controller |
| <code id="controller-map">map</code> | `Object` | `{}` | Contains hash with all controllers routes, those handler callbacks and options |

## Instance methods

### Controller#before( callbacks )

| Name | Type | Description |
| ---- | ---- | ----------- |
| `callbacks` | `...Array<routeHandler>` | List of middlewares which will be invoked before any path handler in controller. Can be useful for options presetting or checking of incoming data |

### Controller#param( name, expression )

| Name | Type | Description |
| ---- | ---- | ----------- |
| `name` | `string` | Name of param (definition equal to `Express`'s [`param`](http://expressjs.com/en/api.html#app.param)) |
| `expression` | `function` | Describing of parameter Name of param (definition equal to `Express`'s [`param`](http://expressjs.com/en/api.html#app.param)) |

### Controller#method( methods, [path, ] [options, ] callbacks )

`Controller#method` build on `Express`'s __[router.METHOD](http://expressjs.com/en/api.html#router.METHOD)__ and extends all possibilities.

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `methods` | `string`, `Array<string>` | none | Name of HTTP(s) method. Can be presented by GET, POST, PUT, DELETE, etc in lowercase (equal to `router.METHOD`) |
| `path` | `URLPath` | `/` | Path is a continuing of controller root and create a new route of requests |
| `options` | `Object` | `{}` | Hash of specified controller options for route. Default value is a base options of current controller |
| `callbacks` | `...Array<routerHandler>` | Handlers of request

#### Aliases of base HTTP methods:

* <span id="method-get">Controller#get([path, ] [options, ] callbacks )</span>
* <span id="method-post">Controller#post([path, ] [options, ] callbacks )</span>
* <span id="method-put">Controller#put([path, ] [options, ] callbacks )</span>
* <span id="method-patch">Controller#patch([path, ] [options, ] callbacks )</span>
* <span id="method-delete">Controller#delete([path, ] [options, ] callbacks )</span>
* _<span id="method-del">Controller#del([path, ] [options, ] callbacks ) <sup>deprecated</sup></span>_

### Controller#use( [path, ] callbacks )

`Controller#use` build on `Express`'s __[router.use](http://expressjs.com/en/api.html#router.use)__ and extends all possibilities.

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `path` | `URLPath` | `/` | Path is a continuing of controller root and create a new route of requests |
| `callbacks` | `...Array<routerHandler>` | Handler(s) of request

### Controller#end( )

Mark the end of controller route handlers definition - controller will send `response.not_found()` if cannot find any handler for current request.

By default go to next controller to find request handlers if `controller.end()` will not be invoked.

#### Examples

##### without `.end()`

```javascript
const controller = app.Controller({
    name: 'controller',
    root: '/'
});
controller.get('/exists', (req, res) => res.ok('response by controller'));

const controller1 = app.Controller({
   name: 'controller1',
   root: '/'
});
controller1.get('/exists1', (req, res) => res.ok('response by controller1'));
```

```bash
curl /exists1   # -> status 200, "response by controller1"
```

##### with `.end()`

```javascript
const controller = app.Controller({
    name: 'controller',
    root: '/'
});
controller.get('/exists', (req, res) => res.ok('response by controller'));
controller.end();

const controller1 = app.Controller({
   name: 'controller1',
   root: '/'
});
controller1.get('/exists1', (req, res) => res.ok('response by controller1'));
```

```bash
curl /exists1   # -> status 404
```

### Controller#error( custom_error_handler )

| Name | Type | Description |
| ---- | ---- | ----------- |
| `custom_error_handler` | `errorHandler` | Method will be invoked when instance of `Error` will be passed into `next_hander()` method of route handler. `ifnode` will search first error handler in parent controller if it cannot set in current controller or throw error in `node.js` if will not find any handler |

### Route handler additional properties

`request` and `response` parameters of route handler are populated by useful custom options.

#### `request` additional properties

| Name | Type | Description |
| ---- | ---- | ----------- |
| <code id="request-data">data</code> | `Object`, `null` | "Syntax sugar" which `request.body`, `request.query` or `null` |

#### `response` additional methods

##### response.ok( [data] )

| Name | Type | Description |
| ---- | ---- | ----------- |
| `data` | `IFResponseData` | Set status `200` and return `data` |

##### response.bad_request( [data] )

| Name | Type | Description |
| ---- | ---- | ----------- |
| `data` | `IFResponseData` | Set status `400` and return `data` or text "Bad Request" |

___Aliases:___
* response.badRequest
* response.fail

##### response.unauthorized( [data] )

| Name | Type | Description |
| ---- | ---- | ----------- |
| `data` | `IFResponseData` | Set status `401` and return `data` |

##### response.forbidden( [data] )

| Name | Type | Description |
| ---- | ---- | ----------- |
| `data` | `IFResponseData` | Set status `403` and return `data` |

##### response.not_found( [data] )

| Name | Type | Description |
| ---- | ---- | ----------- |
| `data` | `IFResponseData` | Set status `404` and return `data` |

___Aliases:___
* response.notFound

##### response.error( [data] )

| Name | Type | Description |
| ---- | ---- | ----------- |
| `data` | `IFResponseData` | Set status `500` and return `data` or text "Server Internal Error" |

___Aliases:___
* response.err

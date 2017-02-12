# IConnectionServer

## Description

Interface for creating and using server connection. By default, it presented by `http` and `https` node.js's module,
but it can be any other internal node.js or some other module (for example, from `npm`).

Name of file with implemented interface class is a connection name from related configuration options (**[see usage example below](#config-local-js)**).

Also internal `ifnode` implementations of server connections have equal to node.js modules names: `http` and `https`. Default connection name is `http`.

## Definition

### JSDoc syntax

```javascript
/**
 * @callback ServerListener
 *
 * @param {IncomingMessage} request
 * @param {ServerResponse}  response
 */

/**
 * @interface IConnectionServer
 * 
 * @param {ServerListener}  listener
 * @param {IFSiteConfig}  config
 */

/**
 * @function IConnectionServer#configure
 * 
 * @param {function}    configurator
 */

/**
 * @function IConnectionServer#listen
 * 
 * @param {function}    [callback]
 */

/**
 * @function IConnectionServer#close
 * 
 * @param {function}    [callback]
 */
```

### TypeScript syntax

```typescript
interface ServerListener {
    (request: IncomingMessage, response: ServerResponse)
}

interface IConnectionServer {
    constructor(listener: ServerListener, config: IFSiteConfig),
    configure(configuration: Function),
    listen(callback?: Function),
    close(callback?: Function)
}
```

### Interface methods

#### IConnectionServer#constructor( listener, config )

##### Arguments

| Name | Type | Description |
| ---- | ---- | ----------- |
| `listener` | [`ServerListener`](https://github.com/ifnode/ifnode/blob/master/core/IConnectionServer.js#L6) | `listener` presented by [Express](https://expressjs.com) instance and set to `app.listener` |
| `config` | [`IFSiteConfig`] (/api/) | Config is `app.config.site` |

#### IConnectionServer#configure( configurator )

##### Arguments

| Name | Type | Description |
| ---- | ---- | ----------- |
| `configurator` | `function` | Set configuration for connection server |

#### IConnectionServer#listen( [callback] )

##### Arguments

| Name | Type | Description |
| ---- | ---- | ----------- |
| `callback` | `function` | Starts connection server. Callback is optional and invokes after server will be started |

#### IConnectionServer#close( [callback] )

##### Arguments

| Name | Type | Description |
| ---- | ---- | ----------- |
| `callback` | `function` | Stops connection server. Callback is optional and invokes after server will be stopped |

## Examples

* Internal `ifnode` realization under `http` and `https` node.js's modules can find **[here](https://github.com/ifnode/ifnode/blob/master/plugins/node-http_s-server.js)**
* Realization of `spdy` and `http2` connection server (based on **[`spdy`](https://www.npmjs.com/package/spdy)** module):
    1. Added connection server like extension:

    #### protected/extensions/spdy-connection-server.js

    ```javascript
    'use strict';
    
    const SPDY = require('spdy');
    const IConnectionServer = require('ifnode/core/IConnectionServer');
    
    /**
     * @class       SPDYConnectionServer
     * @implements  IConnectionServer
     */
    class SPDYConnectionServer extends IConnectionServer {
        /**
         *
         * @returns {https.Server}
         */
        get server() {
            if (!this._server) {
                this._server = SPDY.createServer(this._config.options, this._listener);
            }
    
            return this._server;
        }
    
        /**
         *
         * @param {ServerListener}  listener
         * @param {IFSiteConfig}    config
         */
        constructor(listener, config) {
            super(listener, config);
    
            this._config = config;
            this._listener = listener;
        }
    
        /**
         *
         * @param {function}    configurator
         */
        configure(configurator) {
            configurator(this.server);
        }
    
        /**
         *
         * @param {function}    [callback]
         */
        listen(callback) {
            const config = this._config.local;
            const params = [];
    
            if(config.port) {
                params.push(config.port);
            }
    
            const host = config.host;
    
            if(host !== '127.0.0.1' || host !== 'localhost') {
                params.push(host);
            }
    
            if(typeof callback === 'function') {
                params.push(callback);
            }
    
            this.server.listen.apply(this.server, params);
        }
    
        /**
         *
         * @param {function}    [callback]
         */
        close(callback) {
            this.server.close(callback);
        }
    }
    
    module.exports = SPDYConnectionServer;
    ```
    
    2. Added config with connection server settings:

    #### config/local.js

    ```javascript
    const FS = require('fs');
    
    module.exports = {
        site: {
            connection: 'spdy-connection-server',
            options: {
                  key: FS.readFileSync(__dirname + '/keys/spdy-key.pem'),
                  cert: FS.readFileSync(__dirname + '/keys/spdy-fullchain.pem'),
                
                  // **optional** SPDY-specific options
                  spdy: {
                    protocols: [ 'h2', 'http/1.1'],
                    plain: false
                  }
                /* options from https://github.com/indutny/node-spdy#usage */
            },
            local: {
                port: 5500
            }
        }
    };
    ````
    
    3. Starts `http2` connection server:
    
    #### app.js
    
    ```javascript
    const IFNode = require('ifnode');
    const app = IFNode({
        environment: 'local'
    });
    
    app.connection.listen();
    ```

## IConnectionServer

### Description

Interface for creating and using server connection. By default, it presented by `http` and `https` node.js's module,
but it can be any other internal node.js or some other module (for example, from `npm`).

### Parameters

Methods | Description
:------ | :-----------
.constructor(Express listener, Object config) | Constructor get two options: `listener` is `app.listener` and config is `app.config.site`
.configure(Function configurator) | Set configuration for connection server
.listen([Function callback]) | Starts connection server. Callback is optional and invokes after server will be started
.close([Function callback]) | Stops connection server. Callback is optional and invokes after server will be stopped

### Examples

1. Internal `ifnode` realization under `http` and `https` node.js's modules can find **[here](https://github.com/ifnode/ifnode/blob/master/plugins/node-http_s-server.js)**
2. Realization of `spdy` and `http2` connection server (based on **[`spdy`](https://www.npmjs.com/package/spdy)** module):
    1. Added connection server like extension:
  
    ```javascript
    // protected/extensions/spdy-connection-server.js
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
    
    ```javascript
    // config/local.js
    'use strict';
    
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
    
    ```javascript
    // app.js
    'use strict';
    const IFNode = require('ifnode');
    const app = IFNode({
        environment: 'local'
    });
    
    app.connection.listen();
    ```

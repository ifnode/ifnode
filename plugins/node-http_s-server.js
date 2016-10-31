'use strict';

var _isPlainObject = require('lodash/isPlainObject');
var Util = require('util');
var FS = require('fs');
var HTTP = require('http');
var HTTPS = require('https');

var Log = require('./../core/extensions/log');
var IConnectionServer = require('./../core/IConnectionServer');

/**
 *
 * @class
 * @implements IConnectionServer
 *
 * @param {ServerListener}  listener
 * @param {IFSiteConfig}    config
 */
function NodeHTTPServer(listener, config) {
    this._constructor(listener, config);
}

Util.inherits(NodeHTTPServer, IConnectionServer);

/**
 *
 * @param {ServerListener}  listener
 * @param {IFSiteConfig}    config
 */
NodeHTTPServer.prototype._constructor = function(listener, config) {
    this._config = config;

    Object.defineProperty(this, 'server', {
        enumerable: true,
        value: this._create_server(listener)
    });
};

/**
 *
 * @param {function}    configurator
 */
NodeHTTPServer.prototype.configure = function(configurator) {
    configurator(this.server);
};

/**
 *
 * @param {function}    [callback]
 */
NodeHTTPServer.prototype.listen = function(callback) {
    var config = this._config.local;
    var params = [];

    if(config.port) {
        params.push(config.port);
    }

    var host = config.host;

    if(host !== '127.0.0.1' && host !== 'localhost') {
        params.push(config.host);
    }

    if(typeof callback === 'function') {
        params.push(callback);
    }

    this.server.listen.apply(this.server, params);
};

/**
 *
 * @param {function}    [callback]
 */
NodeHTTPServer.prototype.close = function(callback) {
    this.server.close(callback);
};

/**
 *
 * @param {ServerListener}  listener
 * @returns {http.Server}
 * @private
 */
NodeHTTPServer.prototype._create_server = function(listener) {
    var credentials = this._config.ssl;

    if(!_isPlainObject(credentials)) {
        return HTTP.createServer(listener);
    }

    if(credentials.pfx) {
        credentials = {
            pfx: FS.readFileSync(credentials.pfx, 'utf8')
        };
    } else if(credentials.key && credentials.cert) {
        credentials = {
            key: FS.readFileSync(credentials.key, 'utf8'),
            cert: FS.readFileSync(credentials.cert, 'utf8')
        };
    } else {
        Log.error('extension:ifnode-http', 'Wrong https credentials');
    }

    return HTTPS.createServer(credentials, listener);
};

module.exports = NodeHTTPServer;

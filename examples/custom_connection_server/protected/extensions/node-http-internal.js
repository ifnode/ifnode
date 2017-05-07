'use strict';

var HTTP = require('http');
var IConnectionServer = require('./../../../../core/IConnectionServer');

/**
 * @class                   CustomNodeHTTPServer
 * @implements              IConnectionServer
 * @param {ServerListener}  listener
 * @param {IFSiteConfig}    config
 */
function CustomNodeHTTPServer(listener, config) {
    IConnectionServer.call(this);

    this._config = config;

    this.server = HTTP.createServer(config.options, listener);
}

/**
 *
 * @param {function}    configurator
 */
CustomNodeHTTPServer.prototype.configure = function(configurator) {
    configurator(this.server);
};

/**
 *
 * @param {function}    [callback]
 */
CustomNodeHTTPServer.prototype.listen = function(callback) {
    this.server.listen(this._config.local.port, callback);
};

/**
 *
 * @param {function}    [callback]
 */
CustomNodeHTTPServer.prototype.close = function(callback) {
    this.server.close(callback);
};

module.exports = CustomNodeHTTPServer;

'use strict';

var Log = require('./Log');

/**
 * @callback ServerListener
 *
 * @param {IncomingMessage} request
 * @param {ServerResponse}  response
 */

/**
 *
 * @interface
 *
 * @param {ServerListener}  listener
 * @param {IFSiteConfig}    [config]
 */
function IConnectionServer(listener, config) {
}

/**
 *
 * @param {function}    configurator
 */
IConnectionServer.prototype.configure = function(configurator) {
    Log.error('IConnectionServer#constructor', 'Method must be implemented');
};

/**
 *
 * @param {function}    [callback]
 */
IConnectionServer.prototype.listen = function(callback) {
    Log.error('IConnectionServer#start', 'Method must be implemented');
};

/**
 *
 * @param {function}    [callback]
 */
IConnectionServer.prototype.close = function(callback) {
    Log.error('IConnectionServer#stop', 'Method must be implemented');
};

module.exports = IConnectionServer;

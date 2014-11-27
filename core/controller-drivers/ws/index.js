var url = require('url'),
    clients = require('./clients');

var create_ws_namespace = function(pathname, options) {
    if(pathname in this._ws) {
        throw new Error('Root: %s, Already exist: %s', this._root, pathname);
    }

    var full_path;

    pathname = pathname.replace(/^\/|\/$/g, '');
    full_path = url.resolve(this._root, pathname);

    this.ws[pathname] = this._ws_driver.of(full_path);
    this.ws[pathname].emit_clients = this.ws[pathname].emitClients = emit_clients;

    if(options.alias) {
        this.ws[options.alias] = this.ws[pathname];
    }

    return this.ws[pathname];
};

var ws_handler = function(url, options, callback) {
    var self = this,
        params = self._regulize_route_params([url, options, callback]),
        ws_namespace;

    url = params[0];
    options = params[1];
    callback = params[2][0];

    if(!self._ws) {
        self._ws = {};
    }

    if(!(url in self._ws)) {
        ws_namespace = create_ws_namespace.call(self, url, options);
    }

    ws_namespace.on('connection', function(ws) {
        //if(!this._access_right()) {
        //    return this.access_denied();
        //}

        callback.call(self, ws);
    });
};

var emit_clients = function(clients, event, data) {
    var self = this;

    clients.forEach(function(client_id){
        self.to(client_id).emit(event, data);
    });
};

module.exports = function(app, Controller) {
    var socketio = require('socket.io'),
        ws_driver = socketio(app._http_server);

    ws_driver.on('connection', function(ws) {
        Controller.fn.ws.clients.add(ws.id, ws.request._query);

        ws.on('disconnect', function() {
            Controller.fn.ws.clients.remove(ws.id);
        });
    });

    ws_driver.on('disconnect', function (ws) {
        Controller.fn.ws.clients.remove(ws.id);
    });

    Controller.fn._ws_driver = ws_driver;
    Controller.fn.ws = ws_handler;
    Controller.fn.ws.clients = new clients({
        controller: Controller
    });
};

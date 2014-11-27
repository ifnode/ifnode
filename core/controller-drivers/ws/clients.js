var _ = require('underscore'),

    Clients = function(options) {
        this._options = options || {};
        this._clients = {};
    };

Clients.fn = Clients.prototype;

Clients.fn.get = function(client_id) {
    return this._clients[client_id];
};

Clients.fn.add = function(client_id, data) {
    data = data || {};
    data.client_id = client_id;
    this._clients[client_id] = data;
};

Clients.fn.remove = function(client_id) {
    delete this._clients[client_id];
};

Clients.fn.all = function() {
    return this._clients;
};

/* Underscore functions */

Clients.fn.each = function(iterator, context) {
    _.each(this._clients, iterator, context || this);
};

Clients.fn.pluck = function(property_name) {
    return _.pluck(this._clients, property_name);
};

Clients.fn.filter = function(iterator, context) {
    return _.filter(this._clients, iterator, context || this);
};

Clients.fn.where = function(properties) {
    return _.where(this._clients, properties);
};

Clients.fn.find_where = Clients.fn.findWhere = function(properties) {
    return _.findWhere(this._clients, properties);
};

Clients.fn.map = function(iterator, context) {
    return _.findWhere(this._clients, iterator, context || this);
};

module.exports = Clients;

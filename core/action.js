var path = require('path');

var Action = function(name, handler, controller_name) {
    if( !(this instanceof Action) ) {
        return new Action(name, handler, controller_name);
    }

    this.name = name;
    this.handler = handler;
};
Action.fn = Action.prototype;

Action.fn.ajax_only = function() {
    var self = this;
    var original_handler = self.handler;

    self.handler = function(request, response, next) {
        if(request.xhr) {
            original_handler.apply(null, arguments);
        } else {
            self._ajax_only_handler();
        }
    };
};
Action.fn.ajax_never = function() {
    var original_handler = this.handler;

    this.handler = function(request, response, next) {
        if(request.xhr) {
            response.send(403, 'Ajax never');
        } else {
            original_handler.apply(null, arguments);
        }
    };
};

module.exports = Action;
module.exports.ActionNotFound = (function() {
    function ActionNotFound(message) {
        this.name = "ActionNotFound";
        this.message = message || "Action not found";
    }
    ActionNotFound.prototype = new Error();
    ActionNotFound.prototype.constructor = ActionNotFound;
    return ActionNotFound;
}());
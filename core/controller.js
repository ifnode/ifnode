var ERROR = require('./error'),
    f = require('./libs/fns'),
    Action = require('./action'),
    Routes = require('./routes'),
    Controller;

var path = require('path');
var is_composite_path = function(path) {
    return path.split(this.sep).length > 1;
};

const DEFAULT_LAYOUT = 'index';
const DEFAULT_LAYOUTS_FOLDER_PATH = 'layouts';

Controller = function(options) {
    if( !(this instanceof Controller) ) {
        options.name = options.name || Controller._current_inited_file;
        return new Controller(options);
    }
    this.init.apply(this, arguments);
};

Controller.fn = Controller.prototype;
Controller.fn.init = function(options) {
    this.name = options.name;
    this._layouts_folder_path = require('./application').config.folders.layouts || DEFAULT_LAYOUTS_FOLDER_PATH;

    if( !f.is_object(options) ) {
        ERROR.WrongType('ololo');
    }

    this._initialize_actions(options.routes);
    this._initialize_ajax(options.ajax);
    this._initialize_hooks(options.before);
    this._initialize_filters(options.filter);
};

Controller.fn._initialize_filters = function(filters) {
    // access etc
};
Controller.fn._initialize_actions = function(routes) {
    this._actions = {};
    this._routes = Routes(routes);
};
Controller.fn._initialize_hooks = function(hooks) {
    // before|after|run etc
};
Controller.fn._initialize_ajax = function(ajax) {
    var self = this;

    if( f.is_object(ajax) ) {
        if( f.is_defined(ajax.only) ) {
            ajax.only = f.to_array(ajax.only);
            console.log(self._actions)
            ajax.only.forEach(function(action_name) {
                self._actions[action_name].ajax_only();
            });
        }
        if( f.is_defined(ajax.never) ) {
            !Array.isArray(ajax.never) || (ajax.never = [ajax.never]);
            ajax.never.forEach(function(action_name) {
                self._actions[action_name].ajax_never();
            });
        }
    }
};

Controller.fn._add_action = function(name, handler) {
    if(name in this._actions) {
        throw new Error('Action already set');
    }
    this._actions[name] = Action(name, handler, this._name);
};
Controller.fn._add_action_route = function(name) {
    if( !(name in this._routes) ) {
        // TODO: add default route?
        console.log(this._routes, name);
        throw new Error('Not found route for action');
    }
    this._routes[name].handler = this._actions[name].handler;
    Routes.add(this._routes[name]);
};
Controller.fn.actions = function(new_actions) {
    var self = this;

    f.each(new_actions, function(handler, name) {
        self._add_action(name, handler);
        self._add_action_route(name);
    });
};

Controller.fn.get_view_paths = function(options) {
    var layout, view;

    if( !(f.is_object(options) || f.is_string(options)) ) {
        ERROR.WrongType();
    }

    if( f.is_string(options)) {
        options = { view: options };
    }

    view = options.view;
    layout = options.layout || DEFAULT_LAYOUT;

    return {
        view: is_composite_path(view)? view : path.join(this._name, view),
        layout: is_composite_path(layout)? layout : path.join(this._layouts_folder_path, layout)
    };
};

module.exports = Controller;
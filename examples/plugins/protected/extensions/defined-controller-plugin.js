module.exports = {
    controller: function(app, Controller) {
        Controller.processConfig(function(controller_config) {
            controller_config.controller_plugin_option = 'controller_plugin_option';
        });
        Controller.populate(
            function defined_controller_plugin_populate(request, response, next) {
                response.plugin_response_method = function() {
                    this.ok(request.controller_options.controller_plugin_option);
                };
                next();
            }
        );
        Controller.middleware(
            function() {
                return function defined_controller_plugin_middleware(request, response, next) {
                    next();
                };
            }
        );
    }
};

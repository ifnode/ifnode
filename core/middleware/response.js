var ExtendedResponse = function(request, response, next) {
    var old_render = response.render;

    response.render = function(view_config, options) {
        var response = this;
        var paths = request.controller.get_view_paths(view_config);

        old_render.call(response, paths.view, options || {}, function(error, html) {
            if(error) throw error;
            old_render.call(response, paths.layout, {
                content: html
            });
        });
    };

    next();
};

module.exports = function() {
    return ExtendedResponse;
};
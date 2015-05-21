var app = require('ifnode')('cntllrs'),

    main_controller = app.Controller({
        name: 'main'
    });

main_controller.param('id', function(request, response, next, id) {
    id = +request.params.id;
    request.params.id = isNaN(id)? 0 : id;
    next();
});

main_controller.get(function(request, response) {
    response.ok({ default: true });
});

main_controller.method('get', '/:id', {}, function(request, response) {
    response.ok({ id: request.params.id });
});

main_controller.method(['post', 'put'], '/:id', function(request, response) {
    response.ok({ id: request.params.id });
});

main_controller.get('/error/fire', function(request, response, next) {
    next(new Error('fire'));
});

main_controller.error(function(err, request, response) {
    response.ok({ error: err.message });
});

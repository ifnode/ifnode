var app = require('ifnode')('cntllrs'),

    main_controller = app.Controller({
        name: 'main',
        permanent: 'yes'
    });

main_controller.before(function(request, response, next, next_router) {
    if(!request.user) {
        request.with_user = 'no';
    }

    next();
});

main_controller.param('id', function(request, response, next, id) {
    id = +request.params.id;
    request.params.id = isNaN(id)? 0 : id;
    next();
});

main_controller.get(function(request, response) {
    response.ok({ default: true });
});

main_controller.get('/check_before', function(request, response) {
    response.ok({ with_user: request.with_user });
});
main_controller.get('/check_permanent_options', function(request, response) {
    response.ok({ permanent: request.controller_options.permanent });
});
main_controller.get('/check_custom_options', { custom: 'yes' }, function(request, response) {
    response.ok({ custom: request.controller_options.custom });
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

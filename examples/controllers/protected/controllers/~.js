var app = require('../../../../')('cntllrs'),

    main_controller = app.Controller({
        name: 'main',
        permanent: 'yes'
    });

main_controller.before(function(request, response, next) {
    request.check_before = 'invoked';

    next();
});

main_controller.param('id', function(request, response, next, id) {
    id = +request.params.id;
    request.params.id = isNaN(id)? 0 : id;
    next();
});

main_controller.get({ default_special_options: true }, function(request, response) {
    response.ok({
        default: true,
        default_special_options: request.controller_options.default_special_options
    });
});

main_controller.get('/check_before', function(request, response) {
    response.ok({ check_before: request.check_before });
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

main_controller.delete('/method-delete', function(request, response) {
    response.ok('works');
});

main_controller.del('/method-del', function(request, response) {
    response.ok('works');
});

main_controller.method(['del', 'delete'], '/methods-delete', function(request, response) {
    response.ok('works');
});

main_controller.get('/error/fire', function(request, response, next) {
    next(new Error('fire'));
});

main_controller.use(function(request, response) {
    response.ok({
        echo: request.url
    });
});

main_controller.error(function(err, request, response) {
    response.ok({ error: err.message });
});

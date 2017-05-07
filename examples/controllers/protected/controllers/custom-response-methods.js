var app = require('../../../../')('cntllrs');
var main_controller = app.Controller({
    name: 'custom-response-methods'
});

main_controller.get('/ok', function(request, response) {
    response.ok();
});
main_controller.get('/fail', function(request, response) {
    response.fail();
});
main_controller.get('/bad_request', function(request, response) {
    response.bad_request();
});
main_controller.get('/badRequest', function(request, response) {
    response.badRequest('non-empty-data');
});
main_controller.get('/unauthorized', function(request, response) {
    response.unauthorized();
});
main_controller.get('/forbidden', function(request, response) {
    response.forbidden();
});
main_controller.get('/not_found', function(request, response) {
    response.not_found();
});
main_controller.get('/notFound', function(request, response) {
    response.notFound();
});
main_controller.get('/err', function(request, response) {
    response.err();
});
main_controller.get('/error', function(request, response) {
    response.error('non-empty-data');
});

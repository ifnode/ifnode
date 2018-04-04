var Promise = require('es6-promise');
var app = require('../../../../')('controllers-with-promised-handlers');
var controller = app.Controller({
    name: 'with_promised_handlers',
    root: '/with-promised-handlers'
});

controller.get('/resolved-with-returning-non-promise', function(request, response) {
    Promise.resolve('resolved').then(function(data) {
        response.ok(data);
    });

    return 'uninfluenced-retured-data';
});

controller.get('/resolved-with-returning-promise', function(request, response) {
    return Promise.resolve('resolved').then(function(data) {
        response.ok(data);
    });
});

controller.get('/rejected-caught-by-handler', function(request, response) {
    return Promise.reject('rejected').catch(function(data) {
        response.error(data);
    });
});

controller.get('/rejected-caught-by-ifnode', function() {
    return Promise.reject('rejected');
});

controller.error(function(error, request, response) {
    response.error('default-error-handler:' + error)
});

var app = require('../../../../../')('cntllrs');
var api_end_controller = app.Controller();

api_end_controller.get('/accept-ajax', { ajax: true }, function(request, response) {
    response.ok({
        accept_ajax: true
    });
});
api_end_controller.get('/except-ajax', { ajax: false }, function(request, response) {
    response.ok({
        except_ajax: true
    });
});

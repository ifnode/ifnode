var app = require('../../../../../')('cntllrs');
var api_end_controller = app.Controller();

api_end_controller.get('/jump/to/next', function(request, response, next) {
    next();
});

'use strict';

var app = require('./../../../..')('controller_middleware_with_error');
var controller = app.Controller();

controller.error(function(error, request, response) {
    response.error();
});

'use strict';

var app = require('./../../../..')('middleware-test');
var controller = app.Controller();

controller.get(function(request, response) {
    response.ok();
});

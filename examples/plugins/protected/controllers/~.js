'use strict';

var app = require('./../../../../')('plugins');
var router = app.Controller({
    root: '/'
});

router.get('/defined-controller-plugin', function(request, response) {
    response.plugin_response_method();
});

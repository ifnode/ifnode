var app = require('../../../../../../')('cntllrs'),

    api_v1_user_controller = app.Controller({
        root: '/api/v1/user'
    });

api_v1_user_controller.get(function(request, response) {
});

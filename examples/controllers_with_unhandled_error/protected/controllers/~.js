var app = require('../../../../')('controllers_with_unhandled_error');
var main_controller = app.Controller();

main_controller.get(function() {
    throw new Error('Unhandled error');
});

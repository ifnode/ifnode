'use strict';

var app = require('ifnode')('cntllrs_map'),

    items = [
        { id: 1, name: 'ilfroloff' },
        { id: 2, name: 'ifnode' }
    ],

    main_controller = app.Controller({
        name: 'main',
        permanent: 'yes',

        map: {
            'get /': {
                action: 'get_items',
                custom: 'yes'
            },
            'get /:id': 'get_special_item',

            'post /': [
                'create_item',
                'send_message'
            ],
            'patch  /:id': 'update_item_data',
            'put    /:id': 'update_item_data',
            'delete /:id': {
                action: 'delete_item',
                custom: 'yes'
            }
        }
    });

main_controller.get_items = function(request, response) {
    response.ok('simple route');
};

main_controller.get_special_item = function(request, response) {
    response.ok(items[request.params.id - 1]);
};

main_controller.create_item = function(request, response, next) {
    next();
};
main_controller.send_message = function(request, response) {
    response.ok({ permanent: request.controller_options.permanent });
};

main_controller.update_item_data = function(request, response) {
    response.ok('updated');
};

main_controller.delete_item = function(request, response) {
    response.ok({ custom: request.controller_options.custom });
};

main_controller.error(function() {

});

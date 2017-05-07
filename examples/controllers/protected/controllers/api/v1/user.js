/**
 *
 * @type {Application}
 */
var app = require('./../../../../../../')('cntllrs');
var APIV1UserRouter = app.Controller({
    root: '/api/v1/user'
});

APIV1UserRouter.get(function() {
    throw new Error('Unexpected error on handler');
});

APIV1UserRouter.error(function(error, request, response) {
    response.ok({
        handled_by_api_v1_user: error.message
    });
});

APIV1UserRouter.end();

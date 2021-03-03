/**
 *
 * @type {Application}
 */
var app = require('./../../../../../../')('controllers-partial-loading');
var router = app.Controller({
    root: '/api/v1/user'
});

router.end();

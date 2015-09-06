var app = require('../../../../')('cmpts'),
    third = app.Component();

third.custom = function() {
    return 'is_custom';
};

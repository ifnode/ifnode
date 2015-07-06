var app = require('ifnode')('cmpts'),
    third = app.Component();

third.custom = function() {
    return 'is_custom';
};

var app = require('ifnode')('cmpts'),
    second = app.Component({
        name: 'second'
    });

second.initialize = function() {
    this.initialized = true;
};

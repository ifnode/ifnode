var app = require('../../../../')('cmpts'),
    second = app.Component({
        name: 'second'
    });

second.initialize = function() {
    this.initialized = true;
};

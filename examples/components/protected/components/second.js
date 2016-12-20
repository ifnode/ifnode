var app = require('../../../../')('cmpts');
var second = app.Component({
    name: 'second',
    alias: [
        'second_alias'
    ]
});

second.initialize = function() {
    this.initialized = true;
};

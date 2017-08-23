'use strict';

var app = require('../../../..')('models_custom_schema');

app.Model({
    name: 'ThirdModel'
}, {
    db: 'third_database'
});

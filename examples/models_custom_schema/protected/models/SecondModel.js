'use strict';

var app = require('../../../..')('models_custom_schema');
var FirstModel = app.Model({
    name: 'SecondModel'
}, {
    db: 'second_database',
    alias: 'second_model'
});

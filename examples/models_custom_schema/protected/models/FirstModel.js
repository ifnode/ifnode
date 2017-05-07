'use strict';

var app = require('../../../..')('models_custom_schema');
var FirstModel = app.Model(
    {name: 'FirstModel'},
    'first_database'
);

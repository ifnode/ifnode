'use strict';

var app = require('../../../..')('models_custom_schema');

app.Model({
    name: 'FourthModel'
}, {
    db: 'fourth_database'
});

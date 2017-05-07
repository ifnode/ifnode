'use strict';

var app = require('../../../..')('alias-duplicate-name');

app.Model({
    table: 'SameName'
});

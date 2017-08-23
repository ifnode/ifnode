'use strict';

var app = require('../../../..')('duplicated-names');

app.Model({
    name: 'SameName'
});

'use strict';

var app = require('../../../..')('alias-duplicate-name');

app.Model(
    {collection: 'NonSameName'},
    {alias: 'SameName'}
);

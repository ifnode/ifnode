'use strict';

var app = require('../../../..')('models');
var FirstModel = app.Model({
    name: 'SecondModel',
    custom_property: 'custom_value'
});

FirstModel.sameMethod = function() {
    return 2;
};

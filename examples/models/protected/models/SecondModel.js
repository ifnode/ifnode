'use strict';

var app = require('../../../..')('models');
var FirstModel = app.Model({
    name: 'SecondModel'
});

FirstModel.sameMethod = function() {
    return 2;
};

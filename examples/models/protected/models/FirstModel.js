'use strict';

var app = require('../../../..')('models');
var FirstModel = app.Model({
    name: 'FirstModel'
});

FirstModel.sameMethod = function() {
    return 1;
};

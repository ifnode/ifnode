'use strict';

var Should = require('should');
var app = require('../examples/models/app');

describe('Models', function() {
    describe('app.Model(model_config: Object, [options: Object])', function() {
        it('should exists', function() {
            app.Model.should.be.an.Function;
        });

        it('should creates models', function() {
            app.load();
            Should.equal(app.models.FirstModel.sameMethod(), 1);
            Should.equal(app.models.SecondModel.sameMethod(), 2);
        });
    });
});

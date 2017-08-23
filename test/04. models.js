'use strict';

var Path = require('path');
var Should = require('should');
var IFNode = require('../');
var app = require('../examples/models/app');

describe('Models', function() {
    describe('Models loading', function() {
        it('should initialize several schemas', function() {
            var app = IFNode({
                project_folder: Path.resolve(__dirname, '../examples/models_custom_schema'),
                alias: 'models_custom_schema',
                environment: 'custom-schema',
            });

            app.register([
                'custom-schema',
                'custom-schema-without-constructor',
                'custom-schema-with-empty-driver'
            ]);
            app.load();
        });

        it('should throw doubling names error', function() {
            (function() {
                IFNode({
                    project_folder: Path.resolve(__dirname, '../examples/models_with_errors'),
                    alias: 'duplicated-names',
                    environment: 'duplicated-names'
                }).load();
            }).should.throw();
        });

        it('should throw alias doubling name error', function() {
            (function() {
                IFNode({
                    project_folder: Path.resolve(__dirname, '../examples/models_with_errors'),
                    alias: 'alias-duplicate-name',
                    environment: 'alias-duplicate-name'
                }).load();
            }).should.throw();
        });
    });

    describe('app.Model(model_config: Object, [options: Object])', function() {
        it('should exists', function() {
            app.Model.should.be.an.Function;
        });

        it('should creates models', function() {
            app.load();

            var models = app.models;

            Should.equal(models.FirstModel.sameMethod(), 1);

            var SecondModel = models.SecondModel;

            Should.equal(SecondModel.sameMethod(), 2);
            Should.equal(SecondModel.custom_property, 'custom_value');
        });
    });
});

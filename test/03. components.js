'use strict';

var debug = require('debug')('ifnode:test:components'),
    path = require('path'),
    should = require('should'),

    ifnode = require('../'),
    app = ifnode({
        project_folder: path.resolve(__dirname, '../examples/components'),
        env: 'local',
        alias: 'cmpts'
    }).load();

describe('Components', function() {
    describe('app.Component([options: Object])', function() {
        it('should exists', function () {
            app.Component.should.be.an.Function;
        });

        it('default options', function() {
            app.components.first.config.value.should.be.equal(1);
            app.components.second.config.should.be.equal('value');
            app.components.third.config.should.have.properties({});
        });

        it('application instance options', function() {
            app.first.config.value.should.be.equal(1);
            app.second.config.should.be.equal('value');
            app.third.config.should.have.properties({});
        });
    });

    describe('component', function() {
        it('.initialize(config: Object)', function () {
            app.second.initialized.should.be.true;
        });

        it('custom method', function() {
            app.third.custom().should.be.equal('is_custom');
        });
    });
});

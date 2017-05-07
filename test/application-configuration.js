'use strict';

var Path = require('path');
require('should');
var SuperTest = require('supertest');

var application_builder = require(Path.resolve(__dirname, '../examples/config/app'));
var app = application_builder({
    project_folder: Path.resolve(__dirname, '../examples/config'),
    alias: 'application-configuration',
    environment: 'local'
});

describe('Application configuration', function() {
    it('should be valid configuration', function() {
        var config = app.config;
        var site_config = config.site;

        config.should.be.an.Object();

        config.env.should.be.equal('local');
        config.environment.should.be.equal('local');

        site_config.local.origin.should.be.equal('https://localhost:8080');
        site_config.local.url('/some/path').should.be.equal('https://localhost:8080/some/path');

        site_config.global.ssl.key.should.be.equal(Path.resolve(app.project_folder, 'path/to/key'));

        site_config.global.origin.should.be.equal('https://ifnode.com:3000');
        site_config.global.url('some/path').should.be.equal('https://ifnode.com:3000/some/path');

        config.application.express.should.be.an.Object();
        config.application.folders.should.be.an.Object();

        config.db.virtual.schema.should.be.equal('virtual');
    });

    it("should be non-editable configuration", function() {
        var config = app.config;

        (function() {
            config.site = {};
        }).should.throw();

        (function() {
            config.site.local = {};
        }).should.throw();

        (function() {
            config.site.local.origin = 'my custom origin';
        }).should.throw();
    });

    it("should load different types of global middleware", function(done) {
        var app = application_builder({
            project_folder: Path.resolve(__dirname, '../examples/config'),
            alias: 'middleware-test',
            environment: 'middleware-test'
        });

        app.load();

        SuperTest(app.listener)
            .get('/')
            .expect(200, done);
    });
});

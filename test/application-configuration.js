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

/**
 *
 * @param {Application} app
 */
function validate_local_application(app) {
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

    config.some.function.should.be.Function();
    config.some.instance.should.be.instanceOf(config.some.function);
}

describe('Application configuration', function() {
    it('should be valid configuration', function() {
        validate_local_application(app);
    });

    describe('"configuration" option', function() {
        it("should be valid configuration by relative path", function() {
            var app = application_builder({
                project_folder: Path.resolve(__dirname, '../examples/config'),
                configuration: 'config/local'
            });
            validate_local_application(app);
        });
        it("should be valid configuration by full path", function() {
            var project_path = Path.resolve(__dirname, '../examples/config');
            var app = application_builder({
                project_folder: project_path,
                configuration: Path.resolve(project_path, './config/local')
            });
            validate_local_application(app);
        });
        it("should be valid configuration by object", function() {
            var project_path = Path.resolve(__dirname, '../examples/config');
            var app = application_builder({
                project_folder: project_path,
                configuration: require(Path.resolve(project_path, './config/local'))
            });
            validate_local_application(app);
        });
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

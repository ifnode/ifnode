'use strict';

require('should');
var Path = require('path');
var IFNode = require('./..');

describe('Connection server', function() {
    it('should create default connection server', function(done) {
        var app = IFNode({
            alias: 'default-server'
        });
        var connection = app.connection;

        connection.listen(function() {
            connection.close(function() {
                done();
            });
        });
    });

    it('should create default connection server with specific settings', function(done) {
        var app = IFNode({
            project_folder: Path.resolve(__dirname, '../examples/custom_connection_server'),
            alias: 'default-server-with-specific-settings',
            environment: 'default-server-with-specific-settings'
        });
        var connection = app.connection;

        connection.configure(function(server) {
            server.timeout = 0;
        });

        connection.listen(function() {
            connection.close(function() {
                done();
            });
        });
    });

    it('should create default PFX https connection server', function(done) {
        var app = IFNode({
            project_folder: Path.resolve(__dirname, '../examples/custom_connection_server'),
            alias: 'default-https-server',
            environment: 'default-https-pfx-server'
        });
        var connection = app.connection;

        connection.listen(function() {
            connection.close(function() {
                done();
            });
        });
    });

    it('should create default KEY/CERT https connection server', function(done) {
        var app = IFNode({
            project_folder: Path.resolve(__dirname, '../examples/custom_connection_server'),
            alias: 'default-https-server',
            environment: 'default-https-key-cert-server'
        });
        var connection = app.connection;

        connection.listen(function() {
            connection.close(function() {
                done();
            });
        });
    });

    it('should throw error for unexpected https connection server options', function() {
        (function() {
            IFNode({
                project_folder: Path.resolve(__dirname, '../examples/custom_connection_server'),
                alias: 'default-https-server',
                environment: 'default-https-wrong-type-server'
            });
        }).should.throw();
    });

    it('should create custom internal connection server', function(done) {
        var app = IFNode({
            alias: 'custom-server',
            project_folder: Path.resolve(__dirname, '../examples/custom_connection_server'),
            environment: 'custom-internal-server'
        });

        var connection = app.connection;

        connection.configure(function(server) {
            server.timeout = 0;
        });
        connection.listen(function() {
            connection.close(function() {
                done();
            });
        });
    });

    it('should create custom external connection server', function(done) {
        var app = IFNode({
            alias: 'custom-server',
            project_folder: Path.resolve(__dirname, '../examples/custom_connection_server'),
            environment: 'custom-external-server'
        });

        var connection = app.connection;

        connection.configure(function(server) {
            server.timeout = 0;
        });
        connection.listen(function() {
            connection.close(function() {
                done();
            });
        });
    });

    it('should throw error for non-existing connection server', function() {
        (function() {
            IFNode({
                alias: 'non-exists-server',
                project_folder: Path.resolve(__dirname, '../examples/custom_connection_server'),
                environment: 'non-exists-server'
            });
        }).should.throw();
    });
});

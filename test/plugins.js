'use strict';

require('should');
var Path = require('path');
var SuperTest = require('supertest');
var IFNode = require('../');

var app = IFNode({
    project_folder: Path.resolve(__dirname, '../examples/plugins'),
    alias: 'plugins'
});

app.register([
    'defined-controller-plugin'
]);
app.load();

describe('Plugins', function() {
    it('should attach controller plugin', function(done) {
        SuperTest(app.listener)
            .get('/defined-controller-plugin')
            .expect('controller_plugin_option', done);
    })
});

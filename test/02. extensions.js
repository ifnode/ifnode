'use strict';

var app = require('../examples/extensions/app'),
    should = require('should');

describe('Extensions', function() {
    describe('app.ext', function() {
        it('should exists', function() {
            app.ext.should.be.a.Function;
        });

        it('should have aliases', function() {
            app.extension.should.be.equal(app.ext);
        });
    });

    describe('app.ext(name: String)', function() {
        it('should throw exception', function() {
            (function() {
                app.ext('c');
            }).should.throw();
        });

        it('should return result', function() {
            app.ext('a').should.have.property('value', 'a');
            app.ext('a/b').should.have.property('value', 'a/b');
            app.ext('a/b/c').should.have.property('value', 'a/b/c');
            app.ext('b').should.have.property('value', 'b');
        });
    });
});

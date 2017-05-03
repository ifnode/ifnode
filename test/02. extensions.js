'use strict';

var Should = require('should');
var app = require('../examples/extensions/app');

describe('Extensions', function() {
    describe('app.extension(id: string)', function() {
        it('should exists', function() {
            app.extension.should.be.a.Function();
            app.ext.should.be.a.Function();
        });
    });

    describe('app.extension(name: String)', function() {
        it('should throw exception', function() {
            (function() {
                app.extension('c');
            }).should.throw();
        });

        it('should return result', function() {
            app.extension('a').should.have.property('value', 'a');
            app.ext('a/b').should.have.property('value', 'a/b');
            app.extension('./a/b/c').should.have.property('value', 'a/b/c');
            app.ext('./b').should.have.property('value', 'b');

            Should.equal(app.extension('a'), app.ext('a'));
        });

        it('should show full error in extension', function() {
            var non_exists_extension_name = 'non-exists';
            try {
                app.extension(non_exists_extension_name);
            } catch(error) {
                error.message.should.containEql(non_exists_extension_name);
            }

            try {
                app.extension('with-error');
            } catch(error) {
                Should.equal(error.message, 'Expected error message');
            }
        });
    });
});

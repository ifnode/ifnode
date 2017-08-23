'use strict';

var IConnectionServer = require('./../core/IConnectionServer');

describe('Interfaces', function() {
    it('"IConnectionServer" should has methods', function() {
        var preudo_instance = new IConnectionServer({}, {});

        (function() {
            preudo_instance.configure(function() {});
        }).should.throw();

        (function() {
            preudo_instance.listen(function() {});
        }).should.throw();

        (function() {
            preudo_instance.close(function() {});
        }).should.throw();
    });
});

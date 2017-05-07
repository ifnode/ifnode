module.exports = {
    application: {
        middleware: {
            'should-throw-by-redefining': function(app) {
                app.use(function(request, response, next) {
                    request.data = 'should-throw-by-redefining';
                    next();
                });
            }
        }
    }
};

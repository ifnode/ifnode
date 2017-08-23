module.exports = function mockModule() {
    return function(request, response, next) {
        next();
    };
};

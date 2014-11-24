var middleware = function(app) {
    return {
        auth: require('./auth')(app),
        rest: require('./rest')
    }
};

module.exports = middleware;

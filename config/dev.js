module.exports = {
    site: {
        local: {
            port: 3000
        }
    },

    application: {
        middleware: {
            statics: {
                './': { extensions: ['html'] }
            }
        }
    }
};

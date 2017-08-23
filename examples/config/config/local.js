module.exports = {
    site: {
        local: {
            ssl: true
        },
        global: {
            port: 3000,
            host: 'ifnode.com',
            ssl: {
                key: 'path/to/key',
                cert: 'path/to/cert'
            }
        }
    },

    application: {
        folders: {
            components: 'path/to/components',
            views: 'path/to/views'
        },
        middleware: {
            'statics': 'some/path',
            'testable-middleware': function() {
            }
        }
    }
};

module.exports = {
    site: {
        local: {
            port: 3000,
            ssl: true
        },
        global: {
            host: 'ifnode.com',
            ssl: {
                key: 'path/to/key',
                cert: 'path/to/cert'
            }
        }
    }
};

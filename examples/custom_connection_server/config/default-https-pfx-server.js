var Path = require('path');

module.exports = {
    site: {
        ssl: {
            pfx: Path.resolve(__dirname, './ssl/server.pfx'),
            passphrase: '1'
        },
        local: {
            port: 8080
        }
    }
};

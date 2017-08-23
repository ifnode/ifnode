var pickFirstExternalIPAddress = require('./../protected/extensions/pick-first-external-ip-address');

module.exports = {
    site: {
        local: {
            host: pickFirstExternalIPAddress()
        }
    }
};

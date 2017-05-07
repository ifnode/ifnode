'use strict';

var OS = require('os');
var interfaces = OS.networkInterfaces();

/**
 *
 * @returns {string}
 */
function pickFirstExternalIPAddress() {
    var first_external_ip_address = '';

    Object.keys(interfaces).some(function(interface_name) {
        return interfaces[interface_name].some(function (interface_item) {
            if (
                'IPv4' === interface_item.family &&
                interface_item.internal === false
            ) {
                first_external_ip_address = interface_item.address;
                return true;
            }
        });
    });

    return first_external_ip_address;
}

module.exports = pickFirstExternalIPAddress;

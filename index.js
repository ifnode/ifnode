var ifnode = require('./core/application');

ifnode.helper = require('./core/helper');

ifnode._applications = [];
module.exports = function(configuration) {
    // TODO: create possibility of creating many
    if(!ifnode._applications.length) {
        ifnode._applications.push(ifnode.make(configuration));
    }

    return ifnode._applications[0];
};

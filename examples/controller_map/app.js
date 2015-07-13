'use strict';

var ifnode = require('../../'),
    app = ifnode({
        alias: 'cntllrs_map',
        project_folder: __dirname
    });

module.exports = app.load();

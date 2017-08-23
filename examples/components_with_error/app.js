'use strict';

var ifnode = require('../../');
var app = ifnode({
    project_folder: __dirname,
    env: 'local'
});

return app;

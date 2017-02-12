'use strict';

const Log = require('ifnode/core/extensions/log');
const IFNode = require('ifnode');
const app = IFNode({
    environment: 'dev'
});

app.connection.listen(() => Log(app.config.site.local.origin));

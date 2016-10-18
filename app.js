'use strict';

const IFNode = require('ifnode');
const app = IFNode({
    environment: 'dev'
});

app.connection.listen();

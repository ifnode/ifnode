'use strict';

const Path = require('path');
const buildTOCPage = require('./helpers/buildTOCPage');

buildTOCPage(
    Path.resolve(__dirname, './../_pages/api/toc.md'),
    Path.resolve(__dirname, './../api/index.html')
);

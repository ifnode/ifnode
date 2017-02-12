'use strict';

const Path = require('path');
const buildTOCPage = require('./helpers/buildTOCPage');

buildTOCPage(
    Path.resolve(__dirname, './../_pages/docs/toc.md'),
    Path.resolve(__dirname, './../docs/index.html')
);

'use strict';

const Path = require('path');

const buildPage = require('./helpers/buildPage');
const { MARKDOWN_TOC } = require('./helpers/buildTOC');
const { fromContent } = require('./helpers/convertMDtoHTML');

MARKDOWN_TOC.then(toc => buildPage(
    fromContent(`# Table of Content\n\n${toc}`),
    'docs-toc',
    Path.resolve(__dirname, './../toc.html')
));

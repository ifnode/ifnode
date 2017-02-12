'use strict';

const Path = require('path');

const buildPage = require('./helpers/buildPage');
const { fromFile } = require('./helpers/convertMDtoHTML');

fromFile(Path.resolve(__dirname, './../_pages/index.md'))
    .then(html => buildPage(
        html, 'index', Path.resolve(__dirname, './../index.html')
    ))
    .catch(err => console.error(err));

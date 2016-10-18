'use strict';

const Path = require('path');
const convertMDtoHTML = require('./helpers/convertMDtoHTML');
const read = require('./helpers/readUTF8File');
const write = require('./helpers/writeUTF8File');

Promise
    .all([
        read(Path.resolve(__dirname, './../_layouts/default.html')),
        convertMDtoHTML(Path.resolve(__dirname, './../_pages/index.md'))
    ])
    .then(results => {
        const layout = results[0];
        const html = results[1];

        return write(
            Path.resolve(__dirname, './../index.html'),
            layout
                .replace('__MAIN_CONTENT_CLASS__', 'index')
                .replace('__MAIN_CONTENT__', html)
        );
    })
    .catch(err => console.error(err));

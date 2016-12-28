'use strict';

const Path = require('path');
const { minify } = require('html-minifier');

const package_json = require('./../package.json');

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
                .replace(/__SITE_VERSION__/g, package_json.version)
                .replace('__MAIN_CONTENT_CLASS__', 'index')
                .replace('__MAIN_CONTENT__', minify(html, {
                    html5: true
                }))
        );
    })
    .catch(err => console.error(err));

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
        convertMDtoHTML(Path.resolve(__dirname, './../_pages/docs/toc.md'))
    ])
    .then(results => {
        const layout = results[0];
        const html = results[1];

        return layout
            .replace(/__SITE_VERSION__/g, package_json.version)
            .replace('__MAIN_CONTENT_CLASS__', 'docs-toc')
            .replace('__MAIN_CONTENT__', html)
    })
    .then(html => write(Path.resolve(__dirname, './../docs/toc.html'), minify(html, {
        html5: true
    })))
    .catch(err => console.error(err));

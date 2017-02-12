'use strict';

const Path = require('path');

const buildTOC = require('./buildTOC');
const buildPage = require('./buildPage');
const read = require('./readUTF8File');
const { fromContent } = require('./convertMDtoHTML');

/**
 *
 * @param   {string}    input
 * @param   {string}    output
 * @returns {Promise}
 */
function buildTOCPage(input, output) {
    return Promise
        .all([
            read(Path.resolve(__dirname, './../../_layouts/toc.html')),

            buildTOC(input),
            read(input)
        ])
        .then(([toc_layout, full_toc, toc_md]) => buildPage(
            toc_layout
                .replace('__TOC__', full_toc)
                .replace('__DOC_PAGE__', fromContent(`# Table of Content\n\n${toc_md}`)),

            'docs',
            output
        ))
}

module.exports = buildTOCPage;

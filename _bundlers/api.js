'use strict';

const Path = require('path');
const Diread = require('diread');
const Marked = require('marked');

const buildTOC = require('./helpers/buildTOC');
const buildPage = require('./helpers/buildPage');
const read = require('./helpers/readUTF8File');

const docs_folder = Path.resolve(__dirname, './../_pages/api');
const docs_output = Path.resolve(__dirname, './../api');

Promise
    .all([
        read(Path.resolve(__dirname, './../_layouts/docs.html')),
        Promise.all(
            Diread({
                src: docs_folder,
                mask: filepath => filepath.search('toc.md') === -1
            }).map(filepath => read(filepath).then(content => ({
                filepath,
                content: Marked(content)
            })))
        )
    ])
    .then(([
        doc_layout,
        docs
    ]) => Promise.all(docs.map(({ filepath, content }) => buildTOC(filepath).then(toc => buildPage(
        doc_layout
            .replace('__TOC__', toc)
            .replace('__DOC_PAGE__', content),

        'docs',
        Path.resolve(docs_output, `.${filepath.replace(docs_folder, '').replace('.md', '.html')}`)
    )))))
    .catch(err => console.error(err));

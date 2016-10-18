'use strict';

const Path = require('path');
const Diread = require('diread');
const Marked = require('marked');

const convertMDtoHTML = require('./helpers/convertMDtoHTML');
const read = require('./helpers/readUTF8File');
const write = require('./helpers/writeUTF8File');

const docs_folder = Path.resolve(__dirname, './../_pages/docs');
const docs_output = Path.resolve(__dirname, './../docs');

Promise
    .all([
        read(Path.resolve(__dirname, './../_layouts/default.html')),
        read(Path.resolve(__dirname, './../_layouts/docs.html')),

        read(Path.resolve(docs_folder, './toc.md')).then(content => Marked(content)),
        Promise.all(Diread({src: docs_folder}).map(filepath => read(filepath).then(content => ({
            filepath,
            content: Marked(content)
        }))))
    ])
    .then(results => {
        const default_layout = results[0];
        const doc_layout = results[1];
        const toc = results[2];
        const docs = results[3];

        return Promise.all(docs.map(doc => {
            return write(
                    Path.resolve(
                        docs_output,
                        doc.filepath
                            .replace(docs_folder, '.')
                            .replace('.md', '.html')
                    ),
                    default_layout
                        .replace('__MAIN_CONTENT_CLASS__', 'docs')
                        .replace(
                        '__MAIN_CONTENT__',
                        doc_layout
                            .replace('__TOC__', toc)
                            .replace('__DOC_PAGE__', doc.content)
                    ))
            }
        ));
    })
    .catch(err => console.error(err));


Diread({
    src: docs_folder
}).each(filepath => {
    convertMDtoHTML(filepath)
});

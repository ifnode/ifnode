'use strict';

const Path = require('path');

const read = require('./readUTF8File');
const { fromContent } = require('./convertMDtoHTML');

const pages_folder = Path.resolve(__dirname, './../../_pages');
const MARKDOWN_TOC = Promise.all([
    read(Path.resolve(pages_folder, './docs/toc.md')),
    read(Path.resolve(pages_folder, './api/toc.md'))
]).then(([docs_toc, api_toc]) => `${docs_toc}\n${api_toc}`);

/**
 *
 * @param   {string}    [current_filepath]
 * @returns {Promise.<string>}
 */
function buildTOC(current_filepath) {
    return MARKDOWN_TOC.then(markdown_toc => {
        if (!current_filepath) {
            return fromContent(markdown_toc);
        }

        const relive_doc_path = current_filepath
            .replace(pages_folder, '')
            .replace('.md', '')
            .replace('/toc', '')
            .replace('/index', '');

        // relive_doc_path.split('/');

        const resolve_current_page_from_toc_regexp_string = `\\[(.+?)\\]\\(${relive_doc_path
            .replace(/\//g, '\\/')
            }\\)`;

        return fromContent(markdown_toc.replace(
            new RegExp(resolve_current_page_from_toc_regexp_string),
            '**$1**'
        ));
    })
}

module.exports = buildTOC;
module.exports.MARKDOWN_TOC = MARKDOWN_TOC;

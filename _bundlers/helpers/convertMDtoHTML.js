'use strict';

const Marked = require('marked');
const Renderer = Marked.Renderer;
const Prism = global.Prism = require('prismjs');
const read = require('./readUTF8File');

class MyRenderer extends Renderer {
    heading(text, level, raw) {
        raw = raw
            .replace(/\[([^\[\]]+)\]\(.+?\)/g, '$1')
            .replace(/\([^\(\)]+\)/g, '')
            .replace(/[`]+/g, '')
            .toLowerCase();

        return super.heading(text, level, raw);
    }
}

require('prismjs/components/prism-bash');
require('prismjs/components/prism-coffeescript');
require('prismjs/components/prism-typescript');
require('prismjs/components/prism-jade');

Marked.setOptions({
    renderer: new MyRenderer,

    // highlight: code => Highlight.highlightAuto(code).value
    highlight: (code, language) => {
        if (language === undefined) {
            return code;
        }

        if (language in Prism.languages) {
            return Prism.highlight(code, Prism.languages[language]);
        } else {
            throw new Error(language);
        }
    }
});

/**
 *
 * @param   {string}    content
 * @returns {string}
 */
function fromContent(content) {
    return Marked(content);
}

/**
 *
 * @param   {string}    filepath
 * @returns {Promise}
 */
function fromFile(filepath) {
    return read(filepath).then(fromContent);
}

module.exports.fromContent = fromContent;
module.exports.fromFile = fromFile;

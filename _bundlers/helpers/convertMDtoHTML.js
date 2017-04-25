'use strict';

const Marked = require('marked');
const Renderer = Marked.Renderer;
const Prism = global.Prism = require('prismjs');
const read = require('./readUTF8File');

class MyRenderer extends Renderer {
    /**
     *
     * @param   {string}    text
     * @param   {number}    level
     * @param   {string}    raw
     * @returns {string}
     */
    heading(text, level, raw) {
        const is_class_method = /\#[A-Z]/.test(raw);

        raw = raw
            .replace(/\[([^\[\]]+)\]\(.+?\)/g, '$1')
            .replace(/\([^\(\)]+\)/g, '')
            .replace(/[`]+/g, '')
            .toLowerCase();

        if (is_class_method) {
            raw += '-class';
        }

        text = `${text} <a href="#${this._build_heading_id(raw)}"><span>#</span></a>`;

        return super.heading(text, level, raw);
    }

    /**
     *
     * @private
     * @param   {string}    raw
     * @returns {string}
     */
    _build_heading_id(raw) {
        return `${this.options.headerPrefix}${
            raw.toLowerCase()
               .replace(/[^\w]+/g, '-')
                .replace(/^-|-$/g, '')
        }`;
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

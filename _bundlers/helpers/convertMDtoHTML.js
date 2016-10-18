'use strict';

const Marked = require('marked');
const Prism = global.Prism = require('prismjs');
const read = require('./readUTF8File');
require('prismjs/components/prism-bash');
require('prismjs/components/prism-coffeescript');
require('prismjs/components/prism-jade');

Marked.setOptions({
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
 * @param   {string}    filepath
 * @returns {Promise.<string>}
 */
module.exports = function(filepath) {
    return read(filepath).then(source => Marked(source));
};

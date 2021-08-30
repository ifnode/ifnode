'use strict';

const Path = require('path');
const { minify } = require('html-minifier');

const package_json = require('./../../package.json');

const read = require('./readUTF8File');
const write = require('./writeUTF8File');

/**
 *
 * @param   {string}    main_content
 * @param   {string}    main_content_class
 * @param   {string}    output
 * @returns {Promise}
 */
function buildPage(main_content, main_content_class, output) {
    return read(Path.resolve(__dirname, './../../_layouts/default.html'))
        .then(layout => layout
            .replace(/__SITE_VERSION__/g, package_json.version)
            .replace(/__GA_TRACKING_ID__/g, package_json.settings.GA_TRACKING_ID)
            .replace('__MAIN_CONTENT_CLASS__', main_content_class)
            .replace('__MAIN_CONTENT__', main_content)
        )
        .then(html => write(output, minify(html, {
            html5: true
        })))
        .catch(err => console.error(err));
}

module.exports = buildPage;

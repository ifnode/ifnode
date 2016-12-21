'use strict';

/**
 *
 * @param   {string}    path
 * @returns {string}
 */
function pathWithoutExtension(path) {
    return path.split('.')[0];
}

module.exports = pathWithoutExtension;

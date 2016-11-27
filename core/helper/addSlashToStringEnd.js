'use strict';

/**
 *
 * @param   {string}    string
 * @returns {string}
 */
function addSlashToStringEnd(string) {
    if(string[string.length - 1] !== '/') {
        string += '/';
    }

    return string;
}

module.exports = addSlashToStringEnd;

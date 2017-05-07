'use strict';

/**
 *
 * @param   {string}    str
 * @param   {string}    character
 * @param   {number}    length
 * @returns {string}
 */
function stringFillEndBy(str, character, length) {
    var string_length = str.length;
    var characters_count = length - string_length;

    return str + new Array(characters_count + 1).join(character);
}

module.exports = stringFillEndBy;

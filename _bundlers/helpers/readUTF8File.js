const FS = require('fs');

/**
 *
 * @param   {string}    file_path
 * @returns {Promise.<string>}
 */
function readUTF8File(file_path) {
    return new Promise((resolve, reject) => FS.readFile(file_path, { encoding: 'utf8' },
        (err, src) => err ?
            reject(err) :
            resolve(src)
    ));
}

module.exports = readUTF8File;

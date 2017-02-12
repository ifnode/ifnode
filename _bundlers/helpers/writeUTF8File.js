const FS = require('fs');
const Path = require('path');
const MKPath = require('mkpath');

/**
 *
 * @param   {string}        output
 * @param   {string|Buffer} data
 * @returns {Promise}
 */
module.exports = function writeUTF8File(output, data) {
    return new Promise((resolve, reject) => {
        MKPath(Path.dirname(output), err => {
            if (err) {
                return reject(err);
            }

            const stream = FS.createWriteStream(output);

            stream.on('error', err => reject(err));
            stream.on('close', () => resolve());

            stream.write(data);
            stream.end();
        });
    });
};

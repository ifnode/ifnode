'use strict';

module.exports = function addSlashToStringEnd(str) {
    if(str[str.length - 1] !== '/') {
        str += '/';
    }

    return str;
};

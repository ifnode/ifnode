'use strict';

var toArray = require('./toArray');

/**
 *
 * @param {Array.<*>}   array
 * @param {function}    iterator
 */
function eachSeries(array, iterator) {
    array = toArray(array);

    var length = array.length;

    if(!length) {
        return;
    }

    var i = 0;

    (function next() {
        if(i < length) {
            return iterator(array[i++], next, function interrupt() {
                i = length;
                next();
            });
        }
    })();
}

module.exports = eachSeries;

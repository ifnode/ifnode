'use strict';

var toArray = require('./toArray');

/**
 *
 * @param {Array.<*>}   array
 * @param {Function}    iterator
 * @param {Function}    finish
 */
function eachSeries(array, iterator, finish) {
    array = toArray(array);

    var length = array.length;

    if(!length) {
        return;
    }

    var i = 0;
    var interrupted = false;

    (function next() {
        if(i < length) {
            return iterator(array[i++], next, function interrupt() {
                interrupted = true;
                i = length;
                next();
            });
        } else if (!interrupted) {
            finish();
        }
    })();
}

module.exports = eachSeries;

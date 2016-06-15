'use strict';

module.exports = function eachSeries(array, iterator) {
    if(!(Array.isArray(array) && array.length)) {
        return;
    }

    var i = 0,
        length = array.length,

        next = function() {
            if(i < length) {
                return iterator(array[i++], next, function interrupt() {
                    i = length;
                    next();
                });
            }
        };

    next();
};

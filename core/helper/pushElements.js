'use strict';

module.exports = function pushElements(array, items) {
    items = Array.isArray(items)?
        items :
        [].slice.call(arguments, 1);

    if(items.length > 0) {
        [].push.apply(array, items);
    }
};

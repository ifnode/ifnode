/**
 *
 * @param   {function}  to_invoke
 * @param   {*}         [default_result]
 * @returns {*}
 */
function tryCatch(to_invoke, default_result) {
    try {
        return to_invoke();
    } catch (e) {
        return default_result;
    }
}

module.exports = tryCatch;

/**
 *
 * @param   {function}  path
 * @returns {*}
 * @throws  {Error}
 */
function requireWithSkippingOfMissedModuleError(path) {
    try {
        return require(path);
    } catch (error) {
        if (
            error instanceof Error &&
            error.code === 'MODULE_NOT_FOUND'
        ) {
            return undefined;
        } else {
            throw error;
        }
    }
}

module.exports = requireWithSkippingOfMissedModuleError;

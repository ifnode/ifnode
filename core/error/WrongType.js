module.exports = function(message) {
    throw new Error(message || 'Wrong Type');
};
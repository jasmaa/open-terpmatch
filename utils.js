// utils.js
// Utility functions

/**
 * Chekcs if email is valid
 * 
 * @param {*} email 
 */
function validateEmail(email) {
    const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return emailRegex.test(email);
}

module.exports = {
    validateEmail: validateEmail,
}
// utils.js
// Utility functions
const crypto = require('crypto');

/**
 * Checks if email is valid
 * 
 * @param {*} email 
 */
function validateEmail(email) {
    const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return emailRegex.test(email);
}

/**
 * Generates MD5 hash of email for Gravatar
 * 
 * @param {*} email 
 */
function hashProfile(email) {
    return crypto.createHash('md5')
        .update(email)
        .digest('hex');
}

module.exports = {
    validateEmail: validateEmail,
    hashProfile: hashProfile,
}
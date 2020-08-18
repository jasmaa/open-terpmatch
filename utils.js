// utils.js
// Utility functions
const crypto = require('crypto');

/**
 * Checks if email is valid
 *
 * @param {*} email
 */
function validateEmail(email) {
    const emailRegex = /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return emailRegex.test(email);
}

/**
 * Checks if phone number is valid
 *
 * @param {*} phone
 */
function validatePhone(phone) {
    const phoneRegex = /^(\d{10})?$/;
    return phoneRegex.test(phone);
}

/**
 * Formats phone number
 *
 * @param {*} phone
 */
function formatPhone(phone) {
    if (phone) {
        // assume US
        return `+1${phone}`;
    }
    return phone;
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
    validateEmail,
    validatePhone,
    formatPhone,
    hashProfile,
};

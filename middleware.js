// middleware.js
// Middlware functions

/**
 * Checks if user is authenticated with CAS
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const authorizeUser = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.redirect('/umd/login');
    }
}

/**
 * Checks if user has account
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const authorizeAccount = (req, res, next) => {
    if (req.user.hasAccount) {
        next();
    } else {
        res.redirect('/createAccount');
    }
}

module.exports = {
    authorizeUser: authorizeUser,
    authorizeAccount: authorizeAccount,
}
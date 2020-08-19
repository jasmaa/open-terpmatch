// authController.js
// Handlers for CAS authentication

const { User } = require('../config/db');

/**
 * Receives login redirects from CAS
 *
 * @param {*} req
 * @param {*} res
 */
async function loginReturn(req, res) {
    const user = await User.findOne({ uid: req.user.uid });
    req.user.hasAccount = !!user;

    if (!req.user.hasAccount) {
        res.redirect('/createAccount');
    } else {
        res.redirect('/');
    }
}

/**
 * Logs out user
 *
 * @param {*} req
 * @param {*} res
 */
async function logout(req, res) {
    req.logout();
    res.redirect('https://shib.idm.umd.edu/shibboleth-idp/profile/cas/logout');
}

module.exports = { loginReturn, logout };

// middleware.js
// Middlware functions
const { User } = require('./config/db');

/**
 * Checks if user is authenticated with CAS
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const authorizeCAS = (req, res, next) => {
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

/**
 * Gets user info from MongoDB
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const getUserInfo = async (req, res, next) => {
    const user = await User.findOne({ uid: req.user.uid });
    const crushers = await User.find({ crushes: req.user.uid });
    req.userInfo = { user: user, numCrushers: crushers.length };
    next();
}

module.exports = {
    authorizeUser: authorizeCAS,
    authorizeAccount: authorizeAccount,
    getUserInfo: getUserInfo,
}
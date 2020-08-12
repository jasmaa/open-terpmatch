// middleware.js
// Middlware functions

/**
 * Checks if user is authorized
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const authorizeUser = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(403);
    }
}

module.exports = {
    authorizeUser: authorizeUser,
}
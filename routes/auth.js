// auth.js
// User authentication
const express = require('express');

const router = express.Router();
const passport = require('passport');
const { User } = require('../config/db');

router.get('/umd/login', passport.authenticate('umd-cas'));

router.get('/umd/return', passport.authenticate('umd-cas'), async (req, res) => {
    const user = await User.findOne({ uid: req.user.uid });
    req.user.hasAccount = !!user;

    if (!req.user.hasAccount) {
        res.redirect('/createAccount');
    } else {
        res.redirect('/');
    }
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('https://shib.idm.umd.edu/shibboleth-idp/profile/cas/logout');
});

module.exports = router;

// auth.js
// User authentication
const express = require('express');
const router = express.Router();
const passport = require('passport');
const { User } = require('../config/db');

router.post('/umd/login', passport.authenticate('umd-cas'));

router.get('/umd/return', passport.authenticate('umd-cas'), async (req, res) => {
    let user = await User.findOne({ uid: req.user.uid });
    req.user.hasAccount = !!user;
    res.redirect('/');
});

router.post('/logout', (req, res) => {
    req.logout();
    res.redirect('https://shib.idm.umd.edu/shibboleth-idp/profile/cas/logout');
});

module.exports = router;
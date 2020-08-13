// profile.js
// Profile management
const express = require('express');
const router = express.Router();
const { User } = require('../config/db');
const { authorizeUser } = require('../middleware');

router.route('/createAccount')
    .get(authorizeUser, (req, res) => {
        if (req.user.hasAccount) {
            res.redirect('/');
        } else {
            res.render('createAccount', { title: 'Create Account' })
        }
    })
    .post(authorizeUser, async (req, res) => {
        if (!req.user.hasAccount) {
            const { name, tagline } = req.body;

            user = new User({
                uid: req.user.uid,
                name: name,
                crushes: [],
            })
            await user.save();
            req.user.hasAccount = true;
        }

        res.redirect('/secret');
    });

module.exports = router;
// profile.js
// Profile management
const express = require('express');
const router = express.Router();
const { User } = require('../config/db');
const { authorizeUser, authorizeAccount } = require('../middleware');

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

        res.redirect('/dashboard');
    });

router.route('/profile')
    .get(authorizeUser, authorizeAccount, async (req, res) => {
        const user = await User.findOne({ uid: req.user.uid });
        res.render('profile', { title: 'Profile', user: user });
    })

router.post('/editProfile', authorizeUser, authorizeAccount, async (req, res) => {
    const { name, tagline } = req.body;
    await User.updateOne({ uid: req.user.uid }, { name: name, tagline: tagline });
    res.redirect('/');
});

router.post('/addCrush', authorizeUser, authorizeAccount, async (req, res) => {
    const { crushUID } = req.body;
    await User.updateOne({ uid: req.user.uid }, { $push: { crushes: crushUID } });
    res.redirect('/');
});

router.post('/deleteCrush', authorizeUser, authorizeAccount, async (req, res) => {
    const { crushUID } = req.body;
    await User.updateOne({ uid: req.user.uid }, { $pull: { crushes: crushUID } });
    res.redirect('/');
});

module.exports = router;
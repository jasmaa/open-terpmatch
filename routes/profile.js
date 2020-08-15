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

            const { name } = req.body;

            user = new User({
                uid: req.user.uid,
                name: name,
                crushes: [],
                matches: [],
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
    const { name } = req.body;
    await User.updateOne({ uid: req.user.uid }, { name });
    res.redirect('/');
});

router.post('/addCrush', authorizeUser, authorizeAccount, async (req, res) => {

    const { crushUID } = req.body;
    await User.updateOne({ uid: req.user.uid }, { $push: { crushes: crushUID } });

    // Matches users if both mutual crush
    const crushUser = await User.findOne({ uid: crushUID });
    if (crushUser && crushUser.crushes.includes(req.user.uid)) {
        await Promise.all([
            User.updateOne({ uid: req.user.uid }, { $push: { matches: crushUID } }),
            User.updateOne({ uid: crushUID }, { $push: { matches: req.user.uid } }),
        ]);

        // TODO: notify both users
    }

    res.redirect('/');
});

router.post('/deleteCrush', authorizeUser, authorizeAccount, async (req, res) => {

    const { crushUID } = req.body;
    await User.updateOne({ uid: req.user.uid }, { $pull: { crushes: crushUID } });

    // Removes crush if users were matched
    const crushUser = await User.findOne({ uid: crushUID });
    if (crushUser && crushUser.matches.includes(req.user.uid)) {
        await Promise.all([
            User.updateOne({ uid: req.user.uid }, { $pull: { matches: crushUID } }),
            User.updateOne({ uid: crushUID }, { $pull: { matches: req.user.uid } }),
        ]);
    }

    res.redirect('/');
});

module.exports = router;
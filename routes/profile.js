// profile.js
// Profile management
const express = require('express');
const router = express.Router();
const { User } = require('../config/db');
const { authorizeUser, authorizeAccount, getUserInfo } = require('../middleware');

router.route('/createAccount')
    .get(authorizeUser, (req, res) => {
        if (req.user.hasAccount) {
            res.redirect('/');
        } else {
            res.render('createAccount', { title: 'Create Account' });
        }
    })
    .post(authorizeUser, async (req, res) => {

        if (!req.user.hasAccount) {

            const { name, email } = req.body;
            user = new User({
                uid: req.user.uid,
                name: name,
                email: email,
                crushes: [],
                matches: [],
            });

            try {
                await user.save();
                req.user.hasAccount = true;
                res.redirect('/dashboard');
            } catch (e) {
                res.render('createAccount', { title: 'Create Account', errorMessage: e.message });
            }
        }
    });

router.route('/profile')
    .get(authorizeUser, authorizeAccount, getUserInfo, async (req, res) => {
        res.render('profile', {
            title: 'Profile',
            user: req.userInfo.user,
            numCrushers: req.userInfo.numCrushers,
        });
    })

router.route('/editProfile')
    .get(authorizeUser, authorizeAccount, getUserInfo, async (req, res) => {
        res.render('editProfile', {
            title: 'Edit Profile',
            user: req.userInfo.user,
            numCrushers: req.userInfo.numCrushers,
        });
    })
    .post(authorizeUser, authorizeAccount, async (req, res) => {
        const { email } = req.body;

        try {
            await User.findOneAndUpdate(
                { uid: req.user.uid },
                { $set: { email } },
                { new: true, runValidators: true, useFindAndModify: false }
            );
            res.redirect('/profile');
        } catch (e) {
            const user = await User.findOne({ uid: req.user.uid });
            res.render('editProfile', { title: 'Edit Account', user: user, errorMessage: e.message })
        }
    });

router.post('/addCrush', authorizeUser, authorizeAccount, async (req, res) => {

    const { crushUID } = req.body;
    if (crushUID && crushUID.length > 0) {
        await User.updateOne({ uid: req.user.uid }, { $addToSet: { crushes: crushUID } });

        // Matches users if both mutual crush
        const crushUser = await User.findOne({ uid: crushUID });
        if (crushUser && crushUser.crushes.includes(req.user.uid)) {
            await Promise.all([
                User.updateOne({ uid: req.user.uid }, { $addToSet: { matches: crushUID } }),
                User.updateOne({ uid: crushUID }, { $addToSet: { matches: req.user.uid } }),
            ]);

            // TODO: notify both users
            // TODO: add email account verification
        }
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
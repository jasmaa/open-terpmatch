// profile.js
// Profile management
const express = require('express');
const router = express.Router();
const { User } = require('../config/db');
const { authorizeUser, authorizeAccount, getUserInfo } = require('../middleware');
const twilioClient = require('../config/twilioClient');
const { formatPhone } = require('../utils');

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

            const { name, email, phone } = req.body;

            userInfo = new User({
                uid: req.user.uid,
                name: name,
                email: email || '',
                phone: phone || '',
                crushes: [],
                matches: [],
                isEmailVerified: false,
                isPhoneVerified: false,
            });

            try {

                await userInfo.save();

                // Verify email if entered
                if (email !== undefined && email.length > 0) {
                    await twilioClient.verify.services(process.env.TWILIO_VERIFY_SERVICE)
                        .verifications
                        .create({ to: email, channel: 'email' });
                }

                // Verify phone if entered
                if (phone !== undefined && phone.length > 0) {
                    await twilioClient.verify.services(process.env.TWILIO_VERIFY_SERVICE)
                        .verifications
                        .create({ to: formatPhone(phone), channel: 'sms' });
                }

                req.user.hasAccount = true;
                res.redirect('/dashboard');

            } catch (e) {
                res.render('createAccount', { title: 'Create Account', errorMessages: [e.message] });
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

        const { email, phone } = req.body;

        try {
            const user = await User.findOneAndUpdate(
                { uid: req.user.uid },
                { $set: { email, phone } },
                { runValidators: true, useFindAndModify: false }
            );

            // Update email
            // Resets verification status and determines if email verification needs to be sent
            if (email !== undefined) {
                if (email.length === 0) {
                    // Reset status if email set to empty
                    await User.findOneAndUpdate({ uid: req.user.uid }, { $set: { isEmailVerified: false } });

                } else if (email !== user.email) {
                    // Reset status and verify if email is changed
                    await User.findOneAndUpdate({ uid: req.user.uid }, { $set: { isEmailVerified: false } });
                    await twilioClient.verify.services(process.env.TWILIO_VERIFY_SERVICE)
                        .verifications
                        .create({ to: email, channel: 'email' });
                }
            }

            // Update phone
            if (phone !== undefined) {
                if (phone.length === 0) {
                    await User.findOneAndUpdate({ uid: req.user.uid }, { $set: { isPhoneVerified: false } });

                } else if (phone !== user.phone) {
                    await User.findOneAndUpdate({ uid: req.user.uid }, { $set: { isPhoneVerified: false } });
                    await twilioClient.verify.services(process.env.TWILIO_VERIFY_SERVICE)
                        .verifications
                        .create({ to: formatPhone(phone), channel: 'sms' });
                }
            }

        } catch (e) {
            const user = await User.findOne({ uid: req.user.uid });
            res.render('editProfile', { title: 'Edit Account', user: user, errorMessages: [e.message] });
        }

        res.redirect('/profile');
    });

router.post('/deleteProfile', authorizeUser, authorizeAccount, async (req, res) => {
    // Remove from all crush lists
    await User.updateMany(
        { crushes: req.user.uid },
        { $pull: { crushes: req.user.uid } }
    );

    // Remove from all match lists
    await User.updateMany(
        { matches: req.user.uid },
        { $pull: { matches: req.user.uid } }
    );

    await User.deleteOne({ uid: req.user.uid });

    req.logout();
    res.redirect('https://shib.idm.umd.edu/shibboleth-idp/profile/cas/logout');
});

module.exports = router;
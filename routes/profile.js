// profile.js
// Profile management
const express = require('express');
const { User } = require('../config/db');
const { authorizeCAS, authorizeAccount, getUserInfo } = require('../middleware');
const twilioClient = require('../config/twilioClient');
const { formatPhone } = require('../utils');

const router = express.Router();

router.route('/createAccount')
    .get(authorizeCAS, (req, res) => {
        if (req.user.hasAccount) {
            res.redirect('/');
        } else {
            res.render('createAccount', { title: 'Create Account' });
        }
    })
    .post(authorizeCAS, async (req, res) => {
        if (!req.user.hasAccount) {
            const { name, email, phone } = req.body;

            const userInfo = new User({
                uid: req.user.uid,
                name,
                email,
                phone,
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
    .get(authorizeCAS, authorizeAccount, getUserInfo, async (req, res) => {
        res.render('profile', {
            title: 'Profile',
            user: req.userInfo.user,
            numCrushers: req.userInfo.numCrushers,
        });
    });

router.route('/editProfile')
    .get(authorizeCAS, authorizeAccount, getUserInfo, async (req, res) => {
        res.render('editProfile', {
            title: 'Edit Profile',
            user: req.userInfo.user,
            numCrushers: req.userInfo.numCrushers,
        });
    })
    .post(authorizeCAS, authorizeAccount, async (req, res) => {
        const { email, phone } = req.body;

        try {
            const user = await User.findOneAndUpdate(
                { uid: req.user.uid },
                { $set: { email, phone } },
                { runValidators: true, useFindAndModify: false },
            );

            // Update email
            // Resets verification status and determines if email verification needs to be sent
            if (email !== undefined) {
                if (email.length === 0) {
                    // Reset status if email set to empty
                    await User.findOneAndUpdate(
                        { uid: req.user.uid },
                        { $set: { isEmailVerified: false } },
                        { useFindAndModify: false },
                    );
                } else if (email !== user.email) {
                    // Reset status and verify if email is changed
                    await User.findOneAndUpdate(
                        { uid: req.user.uid },
                        { $set: { isEmailVerified: false } },
                        { useFindAndModify: false },
                    );
                    await twilioClient.verify.services(process.env.TWILIO_VERIFY_SERVICE)
                        .verifications
                        .create({ to: email, channel: 'email' });
                }
            }

            // Update phone
            if (phone !== undefined) {
                if (phone.length === 0) {
                    await User.findOneAndUpdate(
                        { uid: req.user.uid },
                        { $set: { isPhoneVerified: false } },
                        { useFindAndModify: false },
                    );
                } else if (phone !== user.phone) {
                    await User.findOneAndUpdate(
                        { uid: req.user.uid },
                        { $set: { isPhoneVerified: false } },
                        { useFindAndModify: false },
                    );
                    await twilioClient.verify.services(process.env.TWILIO_VERIFY_SERVICE)
                        .verifications
                        .create({ to: formatPhone(phone), channel: 'sms' });
                }
            }
        } catch (e) {
            const user = await User.findOne({ uid: req.user.uid });
            res.render('editProfile', { title: 'Edit Account', user, errorMessages: [e.message] });
        }

        res.redirect('/profile');
    });

router.post('/deleteProfile', authorizeCAS, authorizeAccount, async (req, res) => {
    // Remove from all crush lists
    await User.updateMany(
        { crushes: req.user.uid },
        { $pull: { crushes: req.user.uid } },
    );

    // Remove from all match lists
    await User.updateMany(
        { matches: req.user.uid },
        { $pull: { matches: req.user.uid } },
    );

    await User.deleteOne({ uid: req.user.uid });

    req.logout();
    res.redirect('https://shib.idm.umd.edu/shibboleth-idp/profile/cas/logout');
});

module.exports = router;

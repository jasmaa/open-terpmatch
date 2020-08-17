// verification.js
// Verification
const express = require('express');
const router = express.Router();
const { authorizeUser, authorizeAccount, getUserInfo } = require('../middleware');
const { formatPhone } = require('../utils');
const { User } = require('../config/db');
const twilioClient = require('../config/twilioClient');

router.post('/verifyEmail', authorizeUser, authorizeAccount, getUserInfo, async (req, res) => {

    const { code } = req.body;

    try {
        const check = await twilioClient.verify.services(process.env.TWILIO_VERIFY_SERVICE)
            .verificationChecks
            .create({ to: req.userInfo.user.email, code: code });

        if (check.valid) {
            await User.updateOne({ uid: req.user.uid }, { $set: { isEmailVerified: true } });
            //req.userInfo.user.isEmailVerified = true;
            //res.render('profile', { title: 'Profile', user: req.userInfo.user, successMessages: ['Sucessfully verified email!'] });
            res.redirect('/profile');
        } else {
            res.render('profile', { title: 'Profile', user: req.userInfo.user, errorMessages: ['Could not verify email'] });
        }

    } catch (e) {
        res.render('profile', { title: 'Profile', user: req.userInfo.user, errorMessages: ['Could not verify email'] });
    }
});

router.post('/verifyPhone', authorizeUser, authorizeAccount, getUserInfo, async (req, res) => {

    const { code } = req.body;

    try {
        const check = await twilioClient.verify.services(process.env.TWILIO_VERIFY_SERVICE)
            .verificationChecks
            .create({ to: formatPhone(req.userInfo.user.phone), code: code });

        if (check.valid) {
            await User.updateOne({ uid: req.user.uid }, { $set: { isPhoneVerified: true } });
            res.redirect('/profile');
        } else {
            res.render('profile', { title: 'Profile', user: req.userInfo.user, errorMessages: ['Could not verify phone'] });
        }

    } catch (e) {
        res.render('profile', { title: 'Profile', user: req.userInfo.user, errorMessages: ['Could not verify phone'] });
    }
});

router.post('/resendEmail', authorizeUser, authorizeAccount, getUserInfo, async (req, res) => {

    const { email, isEmailVerified } = req.userInfo.user;

    if (email && !isEmailVerified) {
        await twilioClient.verify.services(process.env.TWILIO_VERIFY_SERVICE)
            .verifications
            .create({ to: email, channel: 'email' });

        res.redirect('/profile');
    } else {
        res.render('profile', { title: 'Profile', user: req.userInfo.user, errorMessages: ['Could not resend code'] });
    }
});

router.post('/resendPhone', authorizeUser, authorizeAccount, getUserInfo, async (req, res) => {

    const { phone, isPhoneVerified } = req.userInfo.user;

    if (phone && !isPhoneVerified) {
        await twilioClient.verify.services(process.env.TWILIO_VERIFY_SERVICE)
            .verifications
            .create({ to: formatPhone(phone), channel: 'sms' });

        res.redirect('/profile');
    } else {
        res.render('profile', { title: 'Profile', user: req.userInfo.user, errorMessages: ['Could not resend code'] });
    }
});

module.exports = router;
// verificationController.js
// Handlers for verifying email and phone number

const { formatPhone } = require('../utils');
const { User } = require('../config/db');
const twilioClient = require('../config/twilioClient');

/**
 * Verifies email
 *
 * @param {*} req
 * @param {*} res
 */
async function verifyEmail(req, res) {
    const { code } = req.query;

    try {
        const check = await twilioClient.verify.services(process.env.TWILIO_VERIFY_SERVICE)
            .verificationChecks
            .create({ to: req.userInfo.user.email, code });

        if (check.valid) {
            await User.updateOne({ uid: req.user.uid }, { $set: { isEmailVerified: true } });
            /*
            req.userInfo.user.isEmailVerified = true;
            res.render('profile', {
                title: 'Profile',
                user: req.userInfo.user,
                successMessages: ['Sucessfully verified email!'],
            });
            */
            res.redirect('/profile');
        } else {
            res.render('profile', { title: 'Profile', user: req.userInfo.user, errorMessages: ['Could not verify email'] });
        }
    } catch (e) {
        res.render('profile', { title: 'Profile', user: req.userInfo.user, errorMessages: ['Could not verify email'] });
    }
}

/**
 * Verifies phone number
 *
 * @param {*} req
 * @param {*} res
 */
async function verifyPhone(req, res) {
    const { code } = req.query;

    try {
        const check = await twilioClient.verify.services(process.env.TWILIO_VERIFY_SERVICE)
            .verificationChecks
            .create({ to: formatPhone(req.userInfo.user.phone), code });

        if (check.valid) {
            await User.updateOne({ uid: req.user.uid }, { $set: { isPhoneVerified: true } });
            res.redirect('/profile');
        } else {
            res.render('profile', { title: 'Profile', user: req.userInfo.user, errorMessages: ['Could not verify phone'] });
        }
    } catch (e) {
        res.render('profile', { title: 'Profile', user: req.userInfo.user, errorMessages: ['Could not verify phone'] });
    }
}

/**
 * Resends email verification code
 *
 * @param {*} req
 * @param {*} res
 */
async function resendEmail(req, res) {
    const { email, isEmailVerified } = req.userInfo.user;

    if (email && !isEmailVerified) {
        await twilioClient.verify.services(process.env.TWILIO_VERIFY_SERVICE)
            .verifications
            .create({ to: email, channel: 'email' });

        res.redirect('/profile');
    } else {
        res.render('profile', { title: 'Profile', user: req.userInfo.user, errorMessages: ['Could not resend code'] });
    }
}

/**
 * Resends phone verification code
 *
 * @param {*} req
 * @param {*} res
 */
async function resendPhone(req, res) {
    const { phone, isPhoneVerified } = req.userInfo.user;

    if (phone && !isPhoneVerified) {
        await twilioClient.verify.services(process.env.TWILIO_VERIFY_SERVICE)
            .verifications
            .create({ to: formatPhone(phone), channel: 'sms' });

        res.redirect('/profile');
    } else {
        res.render('profile', { title: 'Profile', user: req.userInfo.user, errorMessages: ['Could not resend code'] });
    }
}

module.exports = {
    verifyEmail,
    verifyPhone,
    resendEmail,
    resendPhone,
};

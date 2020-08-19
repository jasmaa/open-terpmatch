// profileController.js
// Handlers for profile

const User = require('../models/user');
const twilioClient = require('../config/twilioClient');
const { formatPhone } = require('../utils');

/**
 * Renders account creation page
 *
 * @param {*} req
 * @param {*} res
 */
async function createAccountGet(req, res) {
    if (req.user.hasAccount) {
        res.redirect('/');
    } else {
        res.render('createAccount', { title: 'Create Account' });
    }
}

/**
 * Creates account
 *
 * @param {*} req
 * @param {*} res
 */
async function createAccountPost(req, res) {
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
        } catch (e) {
            res.render('createAccount', { title: 'Create Account', errorMessages: [e.message] });
            return;
        }
    }

    res.redirect('/');
}

/**
 * Renders profile page
 *
 * @param {*} req
 * @param {*} res
 */
async function profile(req, res) {
    res.render('profile', {
        title: 'Profile',
        user: req.userInfo.user,
        numCrushers: req.userInfo.numCrushers,
    });
}

/**
 * Renders edit profile page
 *
 * @param {*} req
 * @param {*} res
 */
async function editProfileGet(req, res) {
    res.render('editProfile', {
        title: 'Edit Profile',
        user: req.userInfo.user,
        numCrushers: req.userInfo.numCrushers,
    });
}

/**
 * Updates profile
 *
 * @param {*} req
 * @param {*} res
 */
async function editProfilePost(req, res) {
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
        return;
    }

    res.redirect('/profile');
}

/**
 * Deletes profile
 *
 * @param {*} req
 * @param {*} res
 */
async function deleteProfile(req, res) {
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
}

module.exports = {
    createAccountGet,
    createAccountPost,
    profile,
    editProfileGet,
    editProfilePost,
    deleteProfile,
};

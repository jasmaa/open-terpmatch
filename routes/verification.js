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
        }
        
        // TODO: replace with success acknowledgement
        res.sendStatus(200);

    } catch (e) {
        console.log(e)
        res.sendStatus(500);
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
        }
        
        // TODO: replace with success acknowledgement
        res.sendStatus(200);

    } catch (e) {
        console.log(e)
        res.sendStatus(500);
    }
});

module.exports = router;
// profile.js
// Profile management
const express = require('express');
const router = express.Router();
const { User } = require('../config/db');
const { authorizeUser } = require('../middleware');

router.post('/createAccount', authorizeUser, async (req, res) => {

    const { name } = req.body;

    if (req.user.hasAccount) {
        res.status(400).send({
            message: 'User already has an account',
        })
    } else {
        user = new User({
            uid: req.user.uid,
            name: name,
            crushes: [],
        })
        await user.save();
        req.user.hasAccount = true;
        res.sendStatus(200);
    }
});

module.exports = router;
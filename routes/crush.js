// crush.js
// Endpoints for modifying crushes
const express = require('express');

const router = express.Router();
const { User } = require('../config/db');
const { authorizeUser, authorizeAccount } = require('../middleware');
const Notifier = require('../config/notifier');

const notifier = new Notifier();

router.post('/addCrush', authorizeUser, authorizeAccount, async (req, res) => {
    const { crushUID } = req.body;
    if (crushUID && crushUID.length > 0 && crushUID !== req.user.uid) {
        const user = await User.findOneAndUpdate(
            { uid: req.user.uid },
            { $addToSet: { crushes: crushUID } },
            { new: true },
        );

        // Matches and notifies both users on mutual crush
        const crushUser = await User.findOne({ uid: crushUID });
        if (
            crushUser
            && crushUser.crushes.includes(req.user.uid)
            && !crushUser.matches.includes(req.user.uid)
        ) {
            await User.updateOne({ uid: req.user.uid }, { $addToSet: { matches: crushUID } });
            await User.updateOne({ uid: crushUID }, { $addToSet: { matches: req.user.uid } });

            await notifier.notifyMatch(user, crushUser);
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
        await User.updateOne({ uid: req.user.uid }, { $pull: { matches: crushUID } });
        await User.updateOne({ uid: crushUID }, { $pull: { matches: req.user.uid } });
    }

    res.redirect('/');
});

module.exports = router;

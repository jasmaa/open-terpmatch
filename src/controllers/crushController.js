// crushController.js
// Handlers for modifying crushes

const User = require('../models/user');
const Notifier = require('../config/notifier');

const notifier = new Notifier();

/**
 * Adds crush to crush list
 *
 * @param {*} req
 * @param {*} res
 */
async function addCrush(req, res) {
    const { crushUID } = req.body;
    if (crushUID && crushUID.length > 0 && crushUID !== req.user.uid) {
        try {
            const user = await User.findOneAndUpdate(
                { uid: req.user.uid, crushes: { $ne: crushUID } },
                { $push: { crushes: { $each: [crushUID], $slice: 10 } } },
                { new: true, useFindAndModify: false, runValidators: true },
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
        } catch (e) {
            res.render('dashboard', {
                title: 'Dashboard',
                user: req.userInfo.user,
                numCrushers: req.userInfo.numCrushers,
                errorMessages: [e.message],
                csrfToken: req.csrfToken(),
            });
            return;
        }
    }

    res.redirect('/');
}

/**
 * Deletes crush from crush list
 *
 * @param {*} req
 * @param {*} res
 */
async function deleteCrush(req, res) {
    const { crushUID } = req.body;
    await User.updateOne({ uid: req.user.uid }, { $pull: { crushes: crushUID } });

    // Removes crush if users were matched
    const crushUser = await User.findOne({ uid: crushUID });
    if (crushUser && crushUser.matches.includes(req.user.uid)) {
        await User.updateOne({ uid: req.user.uid }, { $pull: { matches: crushUID } });
        await User.updateOne({ uid: crushUID }, { $pull: { matches: req.user.uid } });
    }

    res.redirect('/');
}

module.exports = { addCrush, deleteCrush };

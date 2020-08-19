// app.js
// Express application

require('dotenv').config();

const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const UMDCASStrategy = require('passport-umd-cas').Strategy;
const pluralize = require('pluralize');
const { authorizeCAS, authorizeAccount, getUserInfo } = require('./middleware');
const { hashProfile } = require('./utils');
const authController = require('./controllers/authController');
const crushController = require('./controllers/crushController');
const profileController = require('./controllers/profileController');
const verificationController = require('./controllers/verificationController');

const { User } = require('./config/db');

const SECRET_KEY = process.env.SECRET_KEY || 'keyboard cat';

// Passport
passport.use(new UMDCASStrategy({ callbackURL: '/umd/return' }));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

const app = express();

// Middleware
app.use(express.static('public'));
app.use(require('express-session')({ secret: SECRET_KEY, resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'pug');
app.locals = {
    pluralize,
    hashProfile,
};

// Auth routes
app.get('/umd/login', passport.authenticate('umd-cas'));
app.get('/umd/return', passport.authenticate('umd-cas'), authController.loginReturn);
app.get('/logout', authController.logout);

// Profile routes
app.route('/createAccount')
    .get(authorizeCAS, profileController.createAccountGet)
    .post(authorizeCAS, profileController.createAccountPost);
app.route('/profile')
    .get(authorizeCAS, authorizeAccount, getUserInfo, profileController.profile);
app.route('/editProfile')
    .get(authorizeCAS, authorizeAccount, getUserInfo, profileController.editProfileGet)
    .post(authorizeCAS, authorizeAccount, profileController.editProfilePost);
app.post('/deleteProfile', authorizeCAS, authorizeAccount, profileController.deleteProfile);

// Crush routes
app.post('/addCrush', authorizeCAS, authorizeAccount, crushController.addCrush);
app.post('/deleteCrush', authorizeCAS, authorizeAccount, crushController.deleteCrush);

// Verification routes
app.get('/verifyEmail', authorizeCAS, authorizeAccount, getUserInfo, verificationController.verifyEmail);
app.get('/verifyPhone', authorizeCAS, authorizeAccount, getUserInfo, verificationController.verifyPhone);
app.get('/resendEmail', authorizeCAS, authorizeAccount, getUserInfo, verificationController.resendEmail);
app.get('/resendPhone', authorizeCAS, authorizeAccount, getUserInfo, verificationController.resendPhone);

// About
app.get('/about', getUserInfo, (req, res) => {
    res.render('about', {
        title: 'About',
        user: req.userInfo.user,
        numCrushers: req.userInfo.numCrushers,
    });
});

// Dashboard
app.get('/dashboard', authorizeCAS, authorizeAccount, getUserInfo, async (req, res) => {
    res.render('dashboard', {
        title: 'Dashboard',
        user: req.userInfo.user,
        numCrushers: req.userInfo.numCrushers,
    });
});

// Home
app.get('/', (req, res) => {
    if (req.user && req.user.hasAccount) {
        res.redirect('/dashboard');
    } else {
        res.render('home', { title: 'Home' });
    }
});

// Settings
app.route('/settings')
    .get(authorizeCAS, authorizeAccount, getUserInfo, async (req, res) => {
        res.render('settings', {
            title: 'Settings',
            user: req.userInfo.user,
            numCrushers: req.userInfo.numCrushers,
        });
    })
    .post(authorizeCAS, authorizeAccount, getUserInfo, async (req, res) => {
        const { isEmailNotifyOn, isPhoneNotifyOn } = req.body;

        const user = await User.findOneAndUpdate(
            { uid: req.user.uid },
            {
                $set: {
                    isEmailNotifyOn: !!isEmailNotifyOn,
                    isPhoneNotifyOn: !!isPhoneNotifyOn,
                },
            },
            { new: true, useFindAndModify: false },
        );

        res.render('settings', {
            title: 'Settings',
            user,
            numCrushers: req.userInfo.numCrushers,
            successMessages: ['Successfully updated settings!'],
        });
    });

module.exports = app;

// app.js
// Express application

require('dotenv').config();

const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const UMDCASStrategy = require('passport-umd-cas').Strategy;
const mongoose = require('mongoose');
const pluralize = require('pluralize');
const pino = require('pino');
const expressPino = require('express-pino-logger');

const { authorizeCAS, authorizeAccount, getUserInfo } = require('./middleware');
const { hashProfile } = require('./utils');
const authController = require('./controllers/authController');
const crushController = require('./controllers/crushController');
const profileController = require('./controllers/profileController');
const verificationController = require('./controllers/verificationController');
const User = require('./models/user');

const SECRET_KEY = process.env.SECRET_KEY || 'keyboard cat';

// Init db connection
const connStr = process.env.NODE_ENV === 'production'
    ? `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`
    : `mongodb://${process.env.MONGO_HOST}/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`;

mongoose.connect(connStr, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

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
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            res.redirect(`https://${req.headers.host}${req.url}`);
        } else {
            next();
        }
    } else {
        next();
    }
});

app.use(express.static('public'));
app.use(require('express-session')({ secret: SECRET_KEY, resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(csrf({ cookie: true }));
app.set('view engine', 'pug');
app.locals = {
    pluralize,
    hashProfile,
    FEEDBACK_URL: process.env.FEEDBACK_URL,
    TERMS_OF_SERVICE_URL: process.env.TERMS_OF_SERVICE_URL,
    PRIVACY_POLICY_URL: process.env.PRIVACY_POLICY_URL,
};

// Logging
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const expressLogger = expressPino({ logger });
app.use(expressLogger);

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
app.post('/addCrush', authorizeCAS, authorizeAccount, getUserInfo, crushController.addCrush);
app.post('/deleteCrush', authorizeCAS, authorizeAccount, crushController.deleteCrush);

// Verification routes
app.get('/verifyEmail', authorizeCAS, authorizeAccount, getUserInfo, verificationController.verifyEmail);
app.get('/verifyPhone', authorizeCAS, authorizeAccount, getUserInfo, verificationController.verifyPhone);
app.post('/resendEmail', authorizeCAS, authorizeAccount, getUserInfo, verificationController.resendEmail);
app.post('/resendPhone', authorizeCAS, authorizeAccount, getUserInfo, verificationController.resendPhone);

// About
app.get('/about', getUserInfo, (req, res) => {
    res.render('about', {
        title: 'About',
        user: req.userInfo.user,
        numCrushers: req.userInfo.numCrushers,
    });
});

// Privacy
app.get('/privacy', getUserInfo, (req, res) => {
    res.render('privacy', {
        title: 'Privacy Policy',
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
        csrfToken: req.csrfToken(),
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
            csrfToken: req.csrfToken(),
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
            csrfToken: req.csrfToken(),
        });
    });

module.exports = { app, logger };


require('dotenv').config();

const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const UMDCASStrategy = require('passport-umd-cas').Strategy;
const pluralize = require('pluralize');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const crushRoutes = require('./routes/crush');
const verificationRoutes = require('./routes/verification');
const { authorizeUser, authorizeAccount, getUserInfo } = require('./middleware');
const { hashProfile } = require('./utils');
const { User } = require('./config/db');

const PORT = process.env.PORT || 3000;
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
    pluralize: pluralize,
    hashProfile: hashProfile
}

// Routes
app.use('/', authRoutes);
app.use('/', profileRoutes);
app.use('/', crushRoutes);
app.use('/', verificationRoutes);

app.get('/', (req, res) => {
    if (req.user && req.user.hasAccount) {
        res.redirect('/dashboard');
    } else {
        res.render('home', { title: 'Home' });
    }
});

app.get('/about', getUserInfo, (req, res) => {
    res.render('about', {
        title: 'About',
        user: req.userInfo.user,
        numCrushers: req.userInfo.numCrushers,
    });
});

app.get('/dashboard', authorizeUser, authorizeAccount, getUserInfo, async (req, res) => {
    res.render('dashboard', {
        title: 'Dashboard',
        user: req.userInfo.user,
        numCrushers: req.userInfo.numCrushers,
    });
});

app.route('/settings')
    .get(authorizeUser, authorizeAccount, getUserInfo, async (req, res) => {
        res.render('settings', {
            title: 'Settings',
            user: req.userInfo.user,
            numCrushers: req.userInfo.numCrushers,
        });
    })
    .post(authorizeUser, authorizeAccount, getUserInfo, async (req, res) => {

        const { isEmailNotifyOn, isPhoneNotifyOn } = req.body;

        const user = await User.findOneAndUpdate(
            { uid: req.user.uid },
            {
                $set: {
                    isEmailNotifyOn: !!isEmailNotifyOn,
                    isPhoneNotifyOn: !!isPhoneNotifyOn,
                }
            },
            { new: true, useFindAndModify: false }
        );

        res.render('settings', {
            title: 'Settings',
            user: user,
            numCrushers: req.userInfo.numCrushers,
            successMessages: ['Successfully updated settings!'],
        });
    });

console.log(`Started server at ${PORT}...`)
app.listen(PORT);
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const UMDCASStrategy = require('passport-umd-cas').Strategy;
const pluralize = require('pluralize');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const { authorizeUser, authorizeAccount, getUserInfo } = require('./middleware');
const { formatPhone, hashProfile } = require('./utils');
const { User } = require('./config/db');
const twilioClient = require('./config/twilioClient');

require('dotenv').config();

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

app.get('/emailVerify', authorizeUser, authorizeAccount, getUserInfo, async (req, res) => {

    const { code } = req.query;

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

app.get('/phoneVerify', authorizeUser, authorizeAccount, getUserInfo, async (req, res) => {

    const { code } = req.query;

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

console.log(`Started server at ${PORT}...`)
app.listen(PORT);
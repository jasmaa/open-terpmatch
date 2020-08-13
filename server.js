const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const cors = require('cors');
const UMDCASStrategy = require('passport-umd-cas').Strategy;
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

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
//app.use(require('express-session')({ secret: SECRET_KEY, resave: true, saveUninitialized: true }));
//app.use(passport.initialize());
//app.use(passport.session());
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: '*', credentials: true }));

// Routes
app.use('/', authRoutes);
app.use('/', profileRoutes);

console.log(`Started server at ${PORT}...`)
app.listen(PORT);
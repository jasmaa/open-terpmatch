// db.js
// MongoDB configuration
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { validateEmail, validatePhone } = require('../utils');

require('dotenv').config();

const connStr = process.env.NODE_ENV === 'production'
    ? `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`
    : `mongodb://${process.env.MONGO_HOST}/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`;

mongoose.connect(connStr, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const User = mongoose.model('User', new Schema({
    uid: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        validate: {
            validator: validateEmail,
            message: 'Invalid email',
        },
    },
    phone: {
        type: String,
        validate: {
            validator: validatePhone,
            message: 'Invalid phone',
        },
    },
    crushes: [String],
    matches: [String],
    isEmailVerified: Boolean,
    isPhoneVerified: Boolean,
}))

module.exports = {
    User: User,
}
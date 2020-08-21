const mongoose = require('mongoose');

const { Schema } = mongoose;
const { validateEmail, validatePhone } = require('../utils');

const User = mongoose.model('User', new Schema({
    uid: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        maxlength: 256,
    },
    email: {
        type: String,
        validate: {
            validator: validateEmail,
            message: 'Invalid email',
        },
        default: '',
        maxlength: 256,
    },
    phone: {
        type: String,
        validate: {
            validator: validatePhone,
            message: 'Invalid phone',
        },
        default: '',
    },
    crushes: {
        type: [
            {
                type: String,
                maxlength: 256,
            },
        ],
        default: [],
    },
    matches: { type: [String], default: [] },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isEmailNotifyOn: { type: Boolean, default: true },
    isPhoneNotifyOn: { type: Boolean, default: true },
}));

module.exports = User;

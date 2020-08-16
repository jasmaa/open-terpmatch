// db.js
// MongoDB configuration
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { validateEmail } = require('../utils');

require('dotenv').config();

mongoose.connect(
    `mongodb://${process.env.MONGODB_URI}/${process.env.MONGO_DATABASE}`, {
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
    crushes: [String],
    matches: [String],
    isEmailVerified: Boolean,
    isSMSVerified: Boolean,
}))

module.exports = {
    User: User,
}
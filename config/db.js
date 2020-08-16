// db.js
// MongoDB configuration
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { validateEmail } = require('../utils');

require('dotenv').config();

mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
);

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

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
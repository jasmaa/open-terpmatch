// db.js
// MongoDB configuration
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('dotenv').config();

mongoose.connect(
    `mongodb://${process.env.MONGO_HOST}/${process.env.MONGO_DATABASE}`, {
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
    crushes: [String],
    matches: [String],
}))

module.exports = {
    User: User,
}
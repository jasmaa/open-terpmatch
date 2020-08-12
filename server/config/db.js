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
    uid: String,
    name: String,
    crushes: [String],
}))

module.exports = {
    User: User,
}
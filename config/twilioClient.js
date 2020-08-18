// twilioClient.js
// Configures Twilio client for notifications

require('dotenv').config();

const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

module.exports = twilioClient;

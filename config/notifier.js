const twilioClient = require('./twilioClient');
const sgMail = require('@sendgrid/mail');

require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Email and SMS notifier
 */
class Notifier {
    constructor() {
        this.sgSender = process.env.SENDGRID_SENDER;
        this.twilioNumber = process.env.TWILIO_NUMBER;
    }

    /**
     * Notifies both users on match
     * 
     * @param {*} user 
     * @param {*} crushUser 
     */
    async notifyMatchBoth(user, crushUser) {
        await Promise.all([
            this.notifyMatch(user, crushUser),
            this.notifyMatch(crushUser, user),
        ]);
    }

    /**
     * Notifies user of crush user
     * 
     * @param {*} user 
     * @param {*} crushUser 
     */
    async notifyMatch(user, crushUser) {

        const msg = `You've have matched with ${crushUser.name}!`;

        // Notify via email
        if (user.isEmailVerified && user.isEmailNotifyOn) {
            await sgMail.send({
                to: user.email,
                from: this.sgSender,
                subject: 'You got a match!',
                text: msg,
            });
        }

        // Notify via SMS
        if (user.isPhoneVerified && user.isPhoneNotifyOn) {
            await twilioClient.messages
                .create({
                    to: user.phone,
                    from: this.twilioNumber,
                    body: msg,
                });
        }
    }
}

module.exports = Notifier;
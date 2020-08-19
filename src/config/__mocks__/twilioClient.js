const verifications = {
    create: jest.fn(),
};

const verificationChecks = {
    create: jest.fn(({ to, code }) => {
        if (code === 'goodCode') {
            return { valid: true };
        } else {
            throw new Error('Invalid code');
        }
    }),
}

const services = () => {
    return { verifications, verificationChecks }
};

const verify = { services };

module.exports = { verify };
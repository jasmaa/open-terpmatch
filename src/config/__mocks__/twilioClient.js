const create = jest.fn();

const verifications = { create };

const services = () => {
    return { verifications }
};

const verify = { services };

module.exports = { verify };
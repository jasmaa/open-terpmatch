const mockingoose = require('mockingoose').default;
const verificationController = require('../src/controllers/verificationController');
const { mockResponse, mockRequest } = require('./helpers');

jest.mock('../src/config/twilioClient');

beforeEach(() => {
    mockingoose.resetAll();
});

describe('Verify email', () => {
    it('verifies with valid code', async () => {
        const req = mockRequest({
            user: { uid: 'myUID' },
            userInfo: {
                user: {
                    uid: 'myUID',
                    name: 'Ruby Gonzales',
                },
            },
            query: {
                code: 'goodCode',
            },
        });
        const res = mockResponse();

        await verificationController.verifyEmail(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/profile');
    });

    it('verifies with invalid code', async () => {
        const req = mockRequest({
            user: { uid: 'myUID' },
            userInfo: {
                user: {
                    uid: 'myUID',
                    name: 'Ruby Gonzales',
                },
            },
            query: {
                code: 'badCode',
            },
        });
        const res = mockResponse();

        await verificationController.verifyEmail(req, res);

        expect(res.render.mock.calls[0][0]).toBe('profile');
    });
});

describe('Verify phone', () => {
    it('verifies with valid code', async () => {
        const req = mockRequest({
            user: { uid: 'myUID' },
            userInfo: {
                user: {
                    uid: 'myUID',
                    name: 'Ruby Gonzales',
                },
            },
            query: {
                code: 'goodCode',
            },
        });
        const res = mockResponse();

        await verificationController.verifyPhone(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/profile');
    });

    it('verifies with invalid code', async () => {
        const req = mockRequest({
            user: { uid: 'myUID' },
            userInfo: {
                user: {
                    uid: 'myUID',
                    name: 'Ruby Gonzales',
                },
            },
            query: {
                code: 'badCode',
            },
        });
        const res = mockResponse();

        await verificationController.verifyPhone(req, res);

        expect(res.render.mock.calls[0][0]).toBe('profile');
    });
});

describe('Resend email code', () => {
    it('requests code resend and email exists and is not verified', async () => {
        const req = mockRequest({
            user: { uid: 'myUID' },
            userInfo: {
                user: {
                    uid: 'myUID',
                    name: 'Jean-Paul',
                    email: 'test@mail.com',
                    isEmailVerified: false,
                },
            },
        });
        const res = mockResponse();

        await verificationController.resendEmail(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/profile');
        expect(res.render).toHaveBeenCalledTimes(0);
    });

    it('requests code resend and email does not exist', async () => {
        const req = mockRequest({
            user: { uid: 'myUID' },
            userInfo: {
                user: {
                    uid: 'myUID',
                    name: 'Jean-Paul',
                    email: '',
                },
            },
        });
        const res = mockResponse();

        await verificationController.resendEmail(req, res);

        expect(res.redirect).toHaveBeenCalledTimes(0);
        expect(res.render.mock.calls[0][0]).toBe('profile');
    });

    it('requests code resend and email exists and is verified', async () => {
        const req = mockRequest({
            user: { uid: 'myUID' },
            userInfo: {
                user: {
                    uid: 'myUID',
                    name: 'Jean-Paul',
                    email: 'test@mail.com',
                    isEmailVerified: true,
                },
            },
        });
        const res = mockResponse();

        await verificationController.resendEmail(req, res);

        expect(res.redirect).toHaveBeenCalledTimes(0);
        expect(res.render.mock.calls[0][0]).toBe('profile');
    });
});

describe('Resend phone code', () => {
    it('requests code resend and phone exists and is not verified', async () => {
        const req = mockRequest({
            user: { uid: 'myUID' },
            userInfo: {
                user: {
                    uid: 'myUID',
                    name: 'Jean-Paul',
                    phone: '1234567890',
                    isPhoneVerified: false,
                },
            },
        });
        const res = mockResponse();

        await verificationController.resendPhone(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/profile');
        expect(res.render).toHaveBeenCalledTimes(0);
    });

    it('requests code resend and phone does not exist', async () => {
        const req = mockRequest({
            user: { uid: 'myUID' },
            userInfo: {
                user: {
                    uid: 'myUID',
                    name: 'Jean-Paul',
                    phone: '',
                },
            },
        });
        const res = mockResponse();

        await verificationController.resendPhone(req, res);

        expect(res.redirect).toHaveBeenCalledTimes(0);
        expect(res.render.mock.calls[0][0]).toBe('profile');
    });

    it('requests code resend and phone exists and is verified', async () => {
        const req = mockRequest({
            user: { uid: 'myUID' },
            userInfo: {
                user: {
                    uid: 'myUID',
                    name: 'Jean-Paul',
                    phone: '1234567890',
                    isPhoneVerified: true,
                },
            },
        });
        const res = mockResponse();

        await verificationController.resendPhone(req, res);

        expect(res.redirect).toHaveBeenCalledTimes(0);
        expect(res.render.mock.calls[0][0]).toBe('profile');
    });
});

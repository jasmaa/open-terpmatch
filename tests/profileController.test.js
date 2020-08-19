const mockingoose = require('mockingoose').default;
const User = require('../src/models/user');
const profileController = require('../src/controllers/profileController');
const { mockResponse, mockRequest } = require('./helpers');
const twilioClient = require('../src/config/__mocks__/twilioClient');

jest.mock('../src/config/twilioClient');

beforeEach(() => {
    mockingoose.resetAll();
});

describe('Create account', () => {
    it('loads page and does not have account', async () => {
        const req = mockRequest({
            user: { uid: 'myUID', hasAccount: false },
        });
        const res = mockResponse();

        await profileController.createAccountGet(req, res);

        expect(res.render).toHaveBeenCalledWith('createAccount', { title: 'Create Account' });
    });

    it('loads page and already has account', async () => {
        const req = mockRequest({
            user: { uid: 'myUID', hasAccount: true },
        });
        const res = mockResponse();

        await profileController.createAccountGet(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/');
    });

    it('requests valid account with name only not have account', async () => {
        const req = mockRequest({
            user: { uid: 'myUID', hasAccount: false },
            body: {
                name: 'John Smith',
            },
        });
        const res = mockResponse();

        await profileController.createAccountPost(req, res);

        expect(req.user.hasAccount).toBe(true);
        expect(res.redirect).toHaveBeenCalledWith('/');
    });

    it('requests valid account with phone only and does not have account', async () => {
        const req = mockRequest({
            user: { uid: 'myUID', hasAccount: false },
            body: {
                name: 'John Smith',
                phone: '1234567890',
            },
        });
        const res = mockResponse();

        await profileController.createAccountPost(req, res);

        expect(req.user.hasAccount).toBe(true);
        expect(res.redirect).toHaveBeenCalledWith('/');
    });

    it('requests valid account with email and phone and does not have account', async () => {
        const req = mockRequest({
            user: { uid: 'myUID', hasAccount: false },
            body: {
                name: 'John Smith',
                email: 'johnsmith@mail.com',
                phone: '1234567890',
            },
        });
        const res = mockResponse();

        await profileController.createAccountPost(req, res);

        expect(req.user.hasAccount).toBe(true);
        expect(res.redirect).toHaveBeenCalledWith('/');
    });

    it('requests invalid account and does not have account', async () => {
        const req = mockRequest({
            user: { uid: 'myUID', hasAccount: false },
            body: {},
        });
        const res = mockResponse();

        await profileController.createAccountPost(req, res);

        expect(req.user.hasAccount).toBe(false);
        expect(res.render.mock.calls[0][0]).toBe('createAccount');
    });

    it('requests account and already has account', async () => {
        const req = mockRequest({
            user: { uid: 'myUID', hasAccount: true },
            body: {},
        });
        const res = mockResponse();

        await profileController.createAccountPost(req, res);

        expect(req.user.hasAccount).toBe(true);
        expect(res.redirect).toHaveBeenCalledWith('/');
    });
});

describe('Profile', () => {

});

describe('Edit profile', () => {

});

describe('Delete profile', () => {

});
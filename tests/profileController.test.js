const mockingoose = require('mockingoose').default;
const User = require('../src/models/user');
const profileController = require('../src/controllers/profileController');
const { mockResponse, mockRequest } = require('./helpers');

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

        expect(res.render.mock.calls[0][0]).toBe('createAccount');
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
    it('loads page', async () => {
        const req = mockRequest({
            user: { uid: 'myUID', hasAccount: true },
            userInfo: {
                user: { uid: 'myUID', name: 'Alice Brown' },
                numCrushers: 1,
            }
        });
        const res = mockResponse();

        await profileController.profile(req, res);

        expect(res.render.mock.calls[0][0]).toBe('profile');
    });
});

describe('Edit profile', () => {
    it('loads page', async () => {
        const req = mockRequest({
            user: { uid: 'myUID', hasAccount: true },
            userInfo: {
                user: { uid: 'myUID', name: 'Alice Brown' },
                numCrushers: 1,
            }
        });
        const res = mockResponse();

        await profileController.editProfileGet(req, res);

        expect(res.render.mock.calls[0][0]).toBe('editProfile');
    });

    it('requests valid account update with different email and phone', async () => {
        mockingoose(User)
            .toReturn({
                uid: 'myUID',
                name: 'Hanayo',
                email: 'oldEmail@mail.com',
                phone: '0000000000',
            }, 'findOneAndUpdate')

        const req = mockRequest({
            user: { uid: 'myUID', hasAccount: true },
            body: {
                email: 'newEmail@mail.com',
                phone: '1234567890',
            },
        });
        const res = mockResponse();

        await profileController.editProfilePost(req, res);

        expect(res.render).toHaveBeenCalledTimes(0);
        expect(res.redirect).toHaveBeenCalledWith('/profile');
    });

    it('requests valid account update with different email', async () => {
        mockingoose(User)
            .toReturn({
                uid: 'myUID',
                name: 'Hanayo',
                email: 'oldEmail@mail.com',
                phone: '0000000000',
            }, 'findOneAndUpdate')

        const req = mockRequest({
            user: { uid: 'myUID', hasAccount: true },
            body: {
                email: 'newEmail@mail.com',
            },
        });
        const res = mockResponse();

        await profileController.editProfilePost(req, res);

        expect(res.render).toHaveBeenCalledTimes(0);
        expect(res.redirect).toHaveBeenCalledWith('/profile');
    });

    it('requests valid account update removing email and phone', async () => {
        mockingoose(User)
            .toReturn({
                uid: 'myUID',
                name: 'Hanayo',
                email: 'oldEmail@mail.com',
                phone: '0000000000',
            }, 'findOneAndUpdate')

        const req = mockRequest({
            user: { uid: 'myUID', hasAccount: true },
            body: {
                email: '',
                phone: '',
            },
        });
        const res = mockResponse();

        await profileController.editProfilePost(req, res);

        expect(res.render).toHaveBeenCalledTimes(0);
        expect(res.redirect).toHaveBeenCalledWith('/profile');
    });

    it('requests valid account update with same email and phone', async () => {
        mockingoose(User)
            .toReturn({
                uid: 'myUID',
                name: 'Hanayo',
                email: 'oldEmail@mail.com',
                phone: '0000000000',
            }, 'findOneAndUpdate')

        const req = mockRequest({
            user: { uid: 'myUID', hasAccount: true },
            body: {
                email: 'oldEmail@mail.com',
                phone: '0000000000',
            },
        });
        const res = mockResponse();

        await profileController.editProfilePost(req, res);

        expect(res.render).toHaveBeenCalledTimes(0);
        expect(res.redirect).toHaveBeenCalledWith('/profile');
    });

    it('requests invalid account update', async () => {
        mockingoose(User)
            .toReturn(new Error('Invalid email'), 'findOneAndUpdate')

        const req = mockRequest({
            user: { uid: 'myUID', hasAccount: true },
            body: {
                email: 'not an email',
            },
        });
        const res = mockResponse();

        await profileController.editProfilePost(req, res);

        expect(res.render.mock.calls[0][0]).toBe('editProfile');
        expect(res.redirect).toHaveBeenCalledTimes(0);
    });
});

describe('Delete profile', () => {
    it('deletes account and logs out user', async () => {
        const req = mockRequest({
            user: { uid: 'myUID', hasAccount: true },
            userInfo: {
                user: { uid: 'myUID', name: 'Jim Chen' },
                numCrushers: 1,
            }
        });
        const res = mockResponse();

        await profileController.deleteProfile(req, res);

        expect(req.logout).toHaveBeenCalledTimes(1);
        expect(res.redirect.mock.calls[0][0]).toBe('https://shib.idm.umd.edu/shibboleth-idp/profile/cas/logout');
    });
});
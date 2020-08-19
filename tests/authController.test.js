const mockingoose = require('mockingoose').default;
const User = require('../src/models/user');
const authController = require('../src/controllers/authController');
const { mockResponse, mockRequest } = require('./helpers');

beforeEach(() => {
    mockingoose.resetAll();
});

describe('Login return', () => {
    test('Return from login with no account', async () => {
        const req = mockRequest({
            user: { uid: 'myUID' },
        });
        const res = mockResponse();

        await authController.loginReturn(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/createAccount');
    });

    test('Return from login with account', async () => {
        mockingoose(User)
            .toReturn({
                uid: 'myUID',
            }, 'findOne');

        const req = mockRequest({
            user: { uid: 'myUID' },
        });
        const res = mockResponse();

        await authController.loginReturn(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/');
    });

});

describe('Logout', () => {
    test('Logout account', async () => {
        const req = mockRequest();
        const res = mockResponse();

        await authController.logout(req, res);

        expect(req.logout).toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith('https://shib.idm.umd.edu/shibboleth-idp/profile/cas/logout');
    });
});
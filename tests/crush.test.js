const mockingoose = require('mockingoose').default;
const User = require('../src/models/user');
const crushController = require('../src/controllers/crushController');
const { mockResponse, mockRequest } = require('./helpers');

beforeEach(() => {
    mockingoose.resetAll();
});

describe('Add crush', () => {
    test('Add previously non-matched user as crush with no match', async () => {
        mockingoose(User)
            .toReturn({
                uid: 'myUID',
                crushes: ['otherUID'],
            }, 'findOneAndUpdate')
            .toReturn({
                uid: 'otherUID',
            }, 'findOne');

        const req = mockRequest({
            user: { uid: 'myUID' },
            body: {
                crushUID: 'otherUID',
            },
        });
        const res = mockResponse();

        await crushController.addCrush(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/');
    });

    test('Add previously non-matched user as crush with match', async () => {
        mockingoose(User)
            .toReturn({
                uid: 'myUID',
                crushes: ['otherUID'],
            }, 'findOneAndUpdate')
            .toReturn({
                uid: 'otherUID',
                crushes: ['myUID'],
            }, 'findOne');

        const req = mockRequest({
            user: { uid: 'myUID' },
            body: {
                crushUID: 'otherUID',
            },
        });
        const res = mockResponse();

        // TODO: figure out how to mock notifier
        await crushController.addCrush(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/');
    });

    test('Add previously matched user as crush with match', async () => {
        mockingoose(User)
            .toReturn({
                uid: 'myUID',
                crushes: ['otherUID'],
                matches: ['otherUID'],
            }, 'findOneAndUpdate')
            .toReturn({
                uid: 'otherUID',
                crushes: ['myUID'],
                matches: ['myUID'],
            }, 'findOne');

        const req = mockRequest({
            user: { uid: 'myUID' },
            body: {
                crushUID: 'otherUID',
            },
        });
        const res = mockResponse();

        // TODO: figure out how to mock notifier
        await crushController.addCrush(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/');
    });

    test("Add empty string as crush", async () => {
        const req = mockRequest({
            user: { uid: 'myUID' },
            body: {
                crushUID: '',
            },
        });
        const res = mockResponse();

        await crushController.addCrush(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/');
    });

    test("Add self as crush", async () => {
        const req = mockRequest({
            user: { uid: 'myUID' },
            body: {
                crushUID: 'myUID',
            },
        });
        const res = mockResponse();

        await crushController.addCrush(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/');
    });
});

describe('Delete crush', () => {
    test('Delete previously non-matched user', async () => {
        mockingoose(User)
            .toReturn({
                uid: 'otherUID',
            }, 'findOne');

        const req = mockRequest({
            user: { uid: 'myUID' },
            body: {
                crushUID: 'otherUID',
            },
        });
        const res = mockResponse();

        await crushController.deleteCrush(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/');
    });

    test('Delete previously matched user', async () => {
        mockingoose(User)
            .toReturn({
                uid: 'otherUID',
                crushes: ['myUID'],
                matches: ['myUID'],
            }, 'findOne');

        const req = mockRequest({
            user: { uid: 'myUID' },
            body: {
                crushUID: 'otherUID',
            },
        });
        const res = mockResponse();

        await crushController.deleteCrush(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/');
    });

    test("Delete empty string", async () => {
        const req = mockRequest({
            user: { uid: 'myUID' },
            body: {
                crushUID: '',
            },
        });
        const res = mockResponse();

        await crushController.deleteCrush(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/');
    });
});

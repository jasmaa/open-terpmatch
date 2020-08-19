const mockingoose = require('mockingoose').default;
const User = require('../src/models/user');
const crushController = require('../src/controllers/crushController');
const { mockResponse, mockRequest } = require('./helpers');

jest.mock('../src/config/notifier.js');

beforeEach(() => {
    mockingoose.resetAll();
});

describe('Add crush', () => {
    it('adds previously non-matched user as crush with no match', async () => {
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

    it('adds previously non-matched user as crush with match', async () => {
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

        await crushController.addCrush(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/');
    });

    it('adds previously matched user as crush with match', async () => {
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

        await crushController.addCrush(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/');
    });

    it("adds empty string as crush", async () => {
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

    it("adds self as crush", async () => {
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
    it('deletes previously non-matched user', async () => {
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

    it('deletes previously matched user', async () => {
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

    it("deletes empty string", async () => {
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

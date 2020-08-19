const mockingoose = require('mockingoose').default;
const User = require('../src/models/user');
const crushController = require('../src/controllers/crushController');

beforeEach(() => {
    mockingoose.resetAll();
});

test('Add crush', async () => {

    mockingoose(User).toReturn({
        uid: 'person1',
        crushes: [],
    }, 'findOneAndUpdate');

    const req = {
        user: { uid: 'person1' },
        body: {
            crushUID: 'person2',
        },
    };
    const res = {};
    res.redirect = jest.fn().mockReturnValue(res);

    await crushController.addCrush(req, res);

    expect(res.redirect).toHaveBeenCalledWith('/');
});

test("Add self crush", async () => {
    const req = {
        user: { uid: 'person1' },
        body: {
            crushUID: 'person1',
        },
    };
    const res = {};
    res.redirect = jest.fn().mockReturnValue(res);

    await crushController.addCrush(req, res);

    expect(res.redirect).toHaveBeenCalledWith('/');
});
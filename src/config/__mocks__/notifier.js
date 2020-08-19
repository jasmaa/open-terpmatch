
const notifyMatch = jest.fn();

const notifyMatchBoth = jest.fn();

const notifier = jest.fn().mockImplementation(() => {
    return { notifyMatch, notifyMatchBoth }
});

module.exports = notifier;
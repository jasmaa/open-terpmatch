
function mockRequest(req) {
    req = req || {};
    return req;
}

function mockResponse(res) {
    res = res || {};
    res.redirect = jest.fn().mockReturnValue(res);
    res.render = jest.fn().mockReturnValue(res);
    return res
}

module.exports = { mockRequest, mockResponse }
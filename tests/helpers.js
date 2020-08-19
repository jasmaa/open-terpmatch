/**
 * Mock Express request object
 * 
 * @param {*} req
 */
function mockRequest(req) {
    req = req || {};
    req.logout = jest.fn().mockReturnValue(req);
    return req;
}

/**
 * Mock Express response object
 * 
 * @param {*} res
 */
function mockResponse(res) {
    res = res || {};
    res.redirect = jest.fn().mockReturnValue(res);
    res.render = jest.fn().mockReturnValue(res);
    return res
}

module.exports = { mockRequest, mockResponse }
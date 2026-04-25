const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

const registerUser = asyncHandler(async (req, res) => {
    const user = await authService.registerUser(req.body);

    res.status(201).json(user);
});

const loginUser = asyncHandler(async (req, res) => {
    const user = await authService.loginUser(req.body);

    res.json(user);
});

module.exports = {
    registerUser,
    loginUser
};

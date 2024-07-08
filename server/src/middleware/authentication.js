const jwt = require('jsonwebtoken');
const ErrorHandler = require('../utils/errorHandlers');
const AsyncErrors = require('./AsyncErrors');
const User = require('../models/user.models');

exports.isAuthenticatedUser = AsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler('Please login to access this', 401));
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id); //req.user is any js object consisting of all details of an user

    next();
});
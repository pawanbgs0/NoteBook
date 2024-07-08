const ApiResponse = require('../utils/api/apiResponse');
const ErrorHandler = require('../utils/errorHandlers');
const asyncErrors = require('../middleware/AsyncErrors');
const User = require('../models/user.models');
const Post = require('../models/posts.models');
const sendToken = require('../utils/JWTtoken');
const logger = require('../utils/logger');
const sendMail = require('../utils/sendEmail');
const crypto = require('crypto');
const { isValidObjectId, isIdExists } = require('../utils/api/apiValidation');


exports.registerUser = asyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;
    logger.info(`Name: ${name}\n Email: ${email}\n Password: ${password}`);
    const user = await User.create({
        name,
        email,
        password,
    });
    logger.info(`User: ${user}`);
    sendToken(user, 201, res);
});


exports.loginUser = asyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    logger.debug('Starting login process...');

    if (!email || !password) {
        logger.error('Validation error: Please enter your email and password');
        return next(
            new ApiResponse(400, null, 'Please enter your email and password')
        );
    }

    logger.debug(`Querying database for user with email: ${email}`);
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        logger.error(`No user found with email: ${email}`);
        return next(new ApiResponse(401, null, 'Invalid email or password'));
    }

    const passwordMatched = await user.comparePassword(password);

    if (!passwordMatched) {
        logger.error(`Authentication failed for user with email: ${email}`);
        return next(new ApiResponse(401, null, 'Invalid email or password'));
    }

    logger.info(`User with email ${email} logged in successfully`);
    sendToken(user, 200, res);
});

//forgot password
exports.forgotPassword = asyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        logger.error('User not found');
        return next(new ErrorHandler('User not found', 404));
    }

    const resetToken = user.getResetPasswordToken(); //defined models/userModel

    await user.save({ validateBeforeSave: false }); //in getResetPasswordtoken() we are changing some variables of user, those are needed to be updated in the database

    const resetPasswordUrl = `${req.protocol}://${req.get(
        'host'
    )}/password/reset/${resetToken}`;

    const message = `Follow the url to reset your password : \n\n ${resetPasswordUrl} \n\n If u haven't requested it , ignore it `;

    try {
        //defined in utils/sendEmail
        await sendMail({
            email: user.email,
            subject: `Password Recovery`,
            message,
        });
        logger.info(`Email sent successfully to: ${user.email}`);
        res.status(201).json({
            success: true,
            message: `mail sent to ${user.email} successfully`,
        });
    } catch (error) {
        logger.error(`Error sending email: ${error.message}`);
        //in getResetPasswordtoken() we were changing some variables of user, those were also  updated in the database on failure/success they need to be assigned their original value and update the database
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }
});

//reset password
exports.resetPassword = asyncErrors(async (req, res, next) => {
    //console.log(req.params.token)
    logger.info(`Reset password token received: ${req.params.token}`);

    // Hash the reset password token
    resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    // Find the user with the hashed reset password token and a valid expiry date
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    // If no user is found, log an error
    if (!user) {
        logger.error('Reset password token is invalid or has expired');
        return next(
            new ErrorHandler(
                'Reset password token is invalid or has expired',
                404
            )
        );
    }

    // If passwords don't match, log an error
    if (req.body.password != req.body.confirmPassword) {
        logger.error("Password doesn't match");
        return next(new ErrorHandler("Password doesn't match", 400));
    }

    // Update user's password, resetPasswordToken, and resetPasswordExpire fields
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Save the updated user
    await user.save();

    // Log success message
    logger.info('Password reset successfully');

    // Send token and store cookies
    sendToken(user, 200, res); // store cookies
});

//update password after log in
exports.updatePassword = asyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id).select('+password');

    const passwordMatched = await user.comparePassword(req.body.password);

    if (!passwordMatched) {
        logger.error('Wrong password provided');
        return next(new ErrorHandler('Wrong Password', 401));
    }

    if (req.body.newPassword != req.body.confirmPassword) {
        logger.error("New password and confirm password don't match");
        return next(new ErrorHandler("Password doesn't match"));
    }

    user.password = req.body.newPassword;

    await user.save();

    logger.info('Password updated successfully');
    sendToken(user, 200, res); // store cookies
});

exports.getUsers = asyncErrors(async (req, res, next) => {
    try {
        const users = await User.find();
        logger.info('List of users fetched successfully.');

        const totalUsers = users.length;
        data = {
            users: users,
            total: totalUsers,
        };
        response = new ApiResponse(200, data);
        return res.status(200).json(response);
    } catch (err) {
        message = `Failed to fetch the list of users. Reason: ${err}`;
        logger.error(message);
        return next(err);
    }
});

exports.getUserDetails = asyncErrors(async (req, res, next) => {
    const userId = req.params.userId;

    if (!isValidObjectId(userId)) {
        message = `UserId ${userId} is not valid.`;
        logger.error(message);
        const response = new ApiResponse(400, null, message);
        return res.status(400).json(response);
    }
    const doesUserExists = await isIdExists(User, userId);

    if (!doesUserExists) {
        message = `User with userId ${userId} does not exist.`;
        logger.error(message);
        const response = new ApiResponse(400, null, message);
        return res.status(400).json(response);
    }
    try {
        const user = await User.findById(userId);
        logger.info('User details fetched successfully.');
        response = new ApiResponse(200, user);
        return res.status(200).json(response);
    } catch (err) {
        message = `Failed to fetch the user details with userId ${userId}. Reason: ${err}`;
        logger.error(message);
        return next(err);
    }
});

exports.getUserPosts = asyncErrors(async (req, res, next) => {
    const userId = req.params.userId;

    if (!isValidObjectId(userId)) {
        message = `UserId ${userId} is not valid.`;
        logger.error(message);
        const response = new ApiResponse(400, null, message);
        return res.status(400).json(response);
    }
    const doesUserExists = await isIdExists(User, userId);

    if (!doesUserExists) {
        message = `User with userId ${userId} does not exist.`;
        logger.error(message);
        const response = new ApiResponse(400, null, message);
        return res.status(400).json(response);
    }
    try {
        const posts = await Post.find({ author: userId });
        logger.info('Posts fetched successfully.');
        response = new ApiResponse(200, posts);
        return res.status(200).json(response);
    } catch (err) {
        message = `Failed to fetch the posts for user with userId ${userId}. Reason: ${err}`;
        logger.error(message);
        return next(err);
    }
});
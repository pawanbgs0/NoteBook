/**
 * Sends authentication token in a cookie and user data in the response.
 * @param {import('../models/userModel').User} user - The authenticated user.
 * @param {number} statusCode - The HTTP status code to be sent in the response.
 * @param {import('express').Response} res - The Express response object.
 */

const sendToken = (user, statusCode, res) => {
    const token = user.getJWTToken(); //this token is generated only after successfull verification

    //The options object contains settings for the cookie.
    const options = {
        expires: new Date(
            Date.now() + process.env.Expire_Cookie * 24 * 60 * 60 * 1000 //converting to miliseconds
        ),
        httpOnly: true,
    };

    //The res.cookie() method is used to set the cookie in the response. here we are setting the cookie name as token and we are storing the generated token . Option is the setting of the cookie
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        user,
        token,
    });
};

module.exports = sendToken;

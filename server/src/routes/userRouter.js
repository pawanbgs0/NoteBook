const express = require('express');
const { isAuthenticatedUser } = require('../middleware/authentication');

const {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    updatePassword,
    getUsers,
    getUserDetails,
    getUserPosts
} = require('../controllers/userController');

const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);
router.route('/password/update').put(isAuthenticatedUser, updatePassword);
router.route('/:userId/posts').get(isAuthenticatedUser, getUserPosts)
router.route('/:userId').get( getUserDetails)
router.route('').get(getUsers)

module.exports = router;
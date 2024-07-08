const express = require('express');
const { isAuthenticatedUser } = require('../middleware/authentication');

const {
    createPost,
    deletePost,
    editPost,
    getPostDetails,
    getPostsByMonthYear,
    getPostsByViews,
    getPostsByRecentUpdate
} = require('../controllers/postController');

const { 
    incrementPostStats,
} = require('../middleware/stats');

const router = express.Router();

router.route('/create').post(isAuthenticatedUser, incrementPostStats, createPost);
router.route('/views').get(getPostsByViews);
router.route('/time').get(getPostsByRecentUpdate);
router.route('/:month/:year').get(getPostsByMonthYear);
router.route('/:postId').delete(isAuthenticatedUser, deletePost);
router.route('/:postId').put(isAuthenticatedUser, editPost);
router.route('/:postId').get(incrementPostStats, getPostDetails);


module.exports = router;
const express = require('express');
const { isAuthenticatedUser } = require('../middleware/authentication');

const {
    getCategories,
    getCategoryDetails,
    addCategory,
    getTags,
    getTagDetails,
    addTag,
    addPostToCategory,
    addPostToTag
} = require('../controllers/filersController');

const router = express.Router();

router.route('/categories').get(getCategories);
router.route('/categories/:categoryId').get(getCategoryDetails);
router.route('/category/add').post(addCategory);
router.route('/categories/:categoryId/addPost').post(isAuthenticatedUser, addPostToCategory)

router.route('/tags').get(getTags);
router.route('/tags/:tagId').get(getTagDetails);
router.route('/tag/add').post(addTag);
router.route('/tags/:tagId/addPost').post(isAuthenticatedUser, addPostToTag)

module.exports = router;
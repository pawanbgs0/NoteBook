const ApiResponse = require('../utils/api/apiResponse');
const asyncErrors = require('../middleware/AsyncErrors');
const Category = require('../models/category.models')
const Tag = require('../models/tag.models')
const logger = require('../utils/logger');
const { isValidObjectId, isIdExists } = require('../utils/api/apiValidation');

exports.getCategories = asyncErrors(async (req, res, next) => {
    try {
        const categories = await Category.find();
        logger.info('List of categoreis fetched successfully.');

        const totalCategories = categories.length;
        data = {
            categories: categories,
            total: totalCategories,
        };
        response = new ApiResponse(200, data);
        return res.status(200).json(response);
    } catch (err) {
        message = `Failed to fetch the list of categories. Reason: ${err}`;
        logger.error(message);
        return next(err);
    }
});


exports.getCategoryDetails = asyncErrors(async (req, res, next) => {
    const categoryId = req.params.categoryId;

    if (!isValidObjectId(categoryId)) {
        message = `categoryId ${categoryId} is not valid.`;
        logger.error(message);
        const response = new ApiResponse(400, null, message);
        return res.status(400).json(response);
    }
    const doesCategoryExists = await isIdExists(Category, categoryId);

    if (!doesCategoryExists) {
        message = `Category with categoryId ${categoryId} does not exist.`;
        logger.error(message);
        const response = new ApiResponse(400, null, message);
        return res.status(400).json(response);
    }
    try {
        const category = await Category.findById(categoryId);
        logger.info('Categories details fetched successfully.');
        response = new ApiResponse(200, category);
        return res.status(200).json(response);
    } catch (err) {
        message = `Failed to fetch the category details with categoryId ${categoryId}. Reason: ${err}`;
        logger.error(message);
        return next(err);
    }
});


exports.addCategory = async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) {
            message = 'Name is required for the category'
            logger.error(message)
            const response = new ApiResponse(400, null, message);
            return res.status(400).json(response);
        }
        const category = await Category.create({ name });
        logger.info('Category created successfully.');

        const response = new ApiResponse(200, category);
        return res.status(200).json(response);
    } catch (err) {
        const message = `Failed to add category. Reason: ${err.message}`;
        logger.error(message);
        return next(err);
    }
};


exports.getTags = asyncErrors(async (req, res, next) => {
    try {
        const tags = await Tag.find();
        logger.info('List of tags fetched successfully.');

        const total = tags.length;
        data = {
            tags: tags,
            total: total,
        };
        response = new ApiResponse(200, data);
        return res.status(200).json(response);
    } catch (err) {
        message = `Failed to fetch the list of tags. Reason: ${err}`;
        logger.error(message);
        return next(err);
    }
});


exports.getTagDetails = asyncErrors(async (req, res, next) => {
    const tagId = req.params.tagId;

    if (!isValidObjectId(tagId)) {
        message = `tagId ${tagId} is not valid.`;
        logger.error(message);
        const response = new ApiResponse(400, null, message);
        return res.status(400).json(response);
    }
    const doesTagExists = await isIdExists(Tag, tagId);

    if (!doesTagExists) {
        message = `Tag with tagId ${tagId} does not exist.`;
        logger.error(message);
        const response = new ApiResponse(400, null, message);
        return res.status(400).json(response);
    }
    try {
        const tag = await Tag.findById(tagId);
        logger.info('Tag details fetched successfully.');
        response = new ApiResponse(200, tag);
        return res.status(200).json(response);
    } catch (err) {
        message = `Failed to fetch the tag details with tagId ${tagId}. Reason: ${err}`;
        logger.error(message);
        return next(err);
    }
});


exports.addTag = async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) {
            message = 'Name is required for the tag'
            logger.error(message)
            const response = new ApiResponse(400, null, message);
            return res.status(400).json(response);
        }
        const tag = await Tag.create({ name });
        logger.info('tag created successfully.');

        const response = new ApiResponse(200, tag);
        return res.status(200).json(response);
    } catch (err) {
        const message = `Failed to add tag. Reason: ${err.message}`;
        logger.error(message);
        return next(err);
    }
};


exports.addPostToCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const { postId } = req.body;

        if (!postId) {
            const message = 'postId is required for the add post to category';
            logger.error(message);
            const response = new ApiResponse(400, null, message);
            return res.status(400).json(response);
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            const message = `Category with categoryId ${categoryId} not found`;
            logger.error(message);
            const response = new ApiResponse(400, null, message);
            return res.status(400).json(response);
        }

        // Find the post by ID
        const post = await Post.findById(postId);
        if (!post) {
            const message = `Post with postId ${postId} not found`;
            logger.error(message);
            const response = new ApiResponse(400, null, message);
            return res.status(400).json(response);
        }

        // Add post reference to the category
        if (!category.posts.includes(postId)) {
            category.posts.push(postId);
            await category.save();
            logger.info(`Post ${postId} added to category ${categoryId}.`);
        }

        // Add category reference to the post
        if (post.category.toString() !== categoryId) {
            post.category = categoryId;
            await post.save();
            logger.info(`Category ${categoryId} added to post ${postId}.`);
        }

        const response = new ApiResponse(200, { category, post });
        return res.status(200).json(response);

    } catch (err) {
        const message = `Failed to add post to category. Reason: ${err.message}`;
        logger.error(message);
        return next(err);
    }
};


exports.addPostToTag = async (req, res, next) => {
    try {
        const { tagId } = req.params;
        const { postId } = req.body;

        if (!postId) {
            const message = 'postId is required for the add post to tag';
            logger.error(message);
            const response = new ApiResponse(400, null, message);
            return res.status(400).json(response);
        }

        const tag = await Tag.findById(tagId);
        if (!tag) {
            const message = `Tag with TagId ${tagId} not found`;
            logger.error(message);
            const response = new ApiResponse(400, null, message);
            return res.status(400).json(response);
        }

        // Find the post by ID
        const post = await Post.findById(postId);
        if (!post) {
            const message = `Post with postId ${postId} not found`;
            logger.error(message);
            const response = new ApiResponse(400, null, message);
            return res.status(400).json(response);
        }

        // Add post reference to the category
        if (!tag.posts.includes(postId)) {
            tag.posts.push(postId);
            await tag.save();
            logger.info(`Post ${postId} added to tag ${tagId}.`);
        }

        // Add category reference to the post
        if (post.tag.toString() !== tagId) {
            post.tag = tagId;
            await post.save();
            logger.info(`Tag ${tagId} added to post ${postId}.`);
        }

        const response = new ApiResponse(200, { tag, post });
        return res.status(200).json(response);

    } catch (err) {
        const message = `Failed to add post to tag. Reason: ${err.message}`;
        logger.error(message);
        return next(err);
    }
};
const Post = require('../models/posts.models');
const Tag = require('../models/tag.models')
const Category = require('../models/category.models')
const ApiResponse = require('../utils/api/apiResponse');
const logger = require('../utils/logger');
const asyncErrors = require('../middleware/AsyncErrors');
const { isValidObjectId, isIdExists } = require('../utils/api/apiValidation');
const { updateStats } = require('../middleware/stats');

exports.createPost = async (req, res, next) => {
    try {
        const { title, content, author, category, tags } = req.body;

        if (!title || !content || !author || !category) {
            const message = 'Title, content, author, and category are required fields.';
            logger.error(message);
            const response = new ApiResponse(400, null, message);
            return res.status(400).json(response);
        }

        const newPost = new Post({
            title,
            content,
            author,
            category,
            tags
        });

        await newPost.save();

        // Update stats
        await updateStats('overall', 'total_posts');
        await updateStats('daily', 'total_posts');
        await updateStats('yearly', 'total_posts');

        // Update the category with the new post ID
        await Category.findByIdAndUpdate(
            category,
            { $push: { posts: newPost._id } }
        );

        // Update the tags with the new post ID
        if (tags && tags.length > 0) {
            await Tag.updateMany(
                { _id: { $in: tags } },
                { $push: { posts: newPost._id } }
            );
        }

        logger.info('Post created successfully.');

        const response = new ApiResponse(200, newPost);
        return res.status(200).json(response);

    } catch (err) {
        const message = `Failed to create post. Reason: ${err.message}`;
        logger.error(message);
        return next(err);
    }
};


exports.deletePost = async (req, res, next) => {
    const { postId } = req.params;
    if (!isValidObjectId(postId)) {
        message = `postId ${postId} is not valid.`;
        logger.error(message);
        const response = new ApiResponse(400, null, message);
        return res.status(400).json(response);
    }

    try {
        // Remove post reference from the category
        const post = await Post.findById(postId);
        if (!post) {
            const message = `Post with postId ${postId} not found`;
            logger.error(message);
            const response = new ApiResponse(404, null, message);
            return res.status(404).json(response);
        }

        await Category.findByIdAndUpdate(
            post.category,
            { $pull: { posts: postId } }
        );

        // Remove post reference from all tags
        await Tag.updateMany(
            { _id: { $in: post.tags } },
            { $pull: { posts: postId } }
        );

        // Delete the post
        await Post.deleteOne({ _id: postId });

        logger.info('Post deleted successfully.');

        const response = new ApiResponse(200, null, 'Post deleted successfully');
        return res.status(200).json(response);

    } catch (err) {
        const message = `Failed to delete post. Reason: ${err.message}`;
        logger.error(message);
        return next(err);
    }
};


exports.editPost = async (req, res, next) => {
    const { postId } = req.params;
    const { title, content, author, category, tags } = req.body;

    if (!isValidObjectId(postId)) {
        const message = `postId ${postId} is not valid.`;
        logger.error(message);
        const response = new ApiResponse(400, null, message);
        return res.status(400).json(response);
    }

    try {
        // Find the post by ID
        const post = await Post.findById(postId);
        if (!post) {
            const message = `Post with postId ${postId} not found`;
            logger.error(message);
            const response = new ApiResponse(404, null, message);
            return res.status(404).json(response);
        }

        // Check if the category exists
        if (category && !await Category.exists({ _id: category })) {
            const message = `Category with id ${category} not found`;
            logger.error(message);
            const response = new ApiResponse(400, null, message);
            return res.status(400).json(response);
        }

        // Check if the tags exist
        if (tags && tags.length) {
            const validTags = await Tag.find({ _id: { $in: tags } }).select('_id');
            if (validTags.length !== tags.length) {
                const invalidTags = tags.filter(tag => !validTags.some(validTag => validTag._id.equals(tag)));
                const message = `Tag(s) with id(s) ${invalidTags.join(', ')} not found`;
                logger.error(message);
                const response = new ApiResponse(400, null, message);
                return res.status(400).json(response);
            }
        }

        // Update the post fields
        post.title = title || post.title;
        post.content = content || post.content;
        post.author = author || post.author;

        // Check if the category has changed
        if (category && post.category.toString() !== category) {
            // Remove post reference from the old category
            await Category.findByIdAndUpdate(
                post.category,
                { $pull: { posts: postId } }
            );
            // Add post reference to the new category
            await Category.findByIdAndUpdate(
                category,
                { $push: { posts: postId } }
            );
            post.category = category;
        }

        // Check if the tags have changed
        if (tags) {
            // Remove post reference from old tags
            await Tag.updateMany(
                { _id: { $in: post.tags } },
                { $pull: { posts: postId } }
            );
            // Add post reference to new tags
            await Tag.updateMany(
                { _id: { $in: tags } },
                { $push: { posts: postId } }
            );
            post.tags = tags;
        }

        // Save the updated post
        await post.save();

        logger.info('Post updated successfully.');

        const response = new ApiResponse(200, post, 'Post updated successfully');
        return res.status(200).json(response);

    } catch (err) {
        const message = `Failed to update post. Reason: ${err.message}`;
        logger.error(message);
        return next(err);
    }
};

exports.getPostDetails = asyncErrors(async (req, res, next) => {
    const postId = req.params.postId;

    if (!isValidObjectId(postId)) {
        message = `postId ${postId} is not valid.`;
        logger.error(message);
        const response = new ApiResponse(400, null, message);
        return res.status(400).json(response);
    }
    const doesPostExists = await isIdExists(Post, postId);

    if (!doesPostExists) {
        message = `Post with postId ${postId} does not exist.`;
        logger.error(message);
        const response = new ApiResponse(400, null, message);
        return res.status(400).json(response);
    }
    try {
        const post = await Post.findById(postId);
        logger.info('Post details fetched successfully.');
        response = new ApiResponse(200, post);
        return res.status(200).json(response);
    } catch (err) {
        message = `Failed to fetch the post details with postId ${postId}. Reason: ${err}`;
        logger.error(message);
        return next(err);
    }
});


exports.getPostsByMonthYear = async (req, res, next) => {
    const { month, year } = req.params;

    if (!month || !year) {
        const message = 'Month and year are required.';
        logger.error(message);
        const response = new ApiResponse(400, null, message);
        return res.status(400).json(response);
    }

    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);

        const posts = await Post.find({
            createdAt: {
                $gte: startDate,
                $lt: endDate
            }
        });

        logger.info('Posts fetched successfully.');

        const response = new ApiResponse(200, posts);
        return res.status(200).json(response);

    } catch (err) {
        const message = `Failed to fetch posts. Reason: ${err.message}`;
        logger.error(message);
        return next(err);
    }
};


exports.getPostsByViews = async (req, res, next) => {
    try {
        const posts = await Post.find().sort({ views: -1 });

        logger.info('Posts sorted by views fetched successfully.');

        const response = new ApiResponse(200, posts);
        return res.status(200).json(response);

    } catch (err) {
        const message = `Failed to fetch posts by views. Reason: ${err.message}`;
        logger.error(message);
        return next(err);
    }
};


exports.getPostsByRecentUpdate = async (req, res, next) => {
    try {
        const posts = await Post.find().sort({ updatedAt: -1 });

        logger.info('Posts sorted by recent update fetched successfully.');

        const response = new ApiResponse(200, posts);
        return res.status(200).json(response);

    } catch (err) {
        const message = `Failed to fetch posts by recent update. Reason: ${err.message}`;
        logger.error(message);
        return next(err);
    }
};


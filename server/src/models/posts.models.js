const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
        views: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
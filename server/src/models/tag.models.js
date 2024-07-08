const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tagSchema = new mongoose.Schema({
    name: { type: String, required: true },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
});

const Tag = mongoose.model('Tag', tagSchema);
module.exports = Tag
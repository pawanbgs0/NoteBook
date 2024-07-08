const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
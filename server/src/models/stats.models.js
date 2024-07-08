const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema(
    {
        type: { 
            type: String, 
            enum: ['overall', 'daily', 'yearly'], 
            required: true 
        },
        date: { type: Date, default: null }, // Used for daily stats
        year: { type: Number, default: null }, // Used for yearly stats
        total_posts: { type: Number, required: true, default: 0 },
        total_visitors: { type: Number, required: true, default: 0 },
        total_subscribers: { type: Number, required: true, default: 0 },
        blog_reads: { type: Number, required: true, default: 0 },
    }, { timestamps: true }
);

const Stats = mongoose.model('Stats', statsSchema);
module.exports = Stats;
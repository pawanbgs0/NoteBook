const Stats = require('../models/stats.models');
const logger = require('../utils/logger');

const updateStats = async (type, incrementField) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const today = new Date(currentDate.setHours(0, 0, 0, 0));

    let filter = {};
    if (type === 'daily') {
        filter = { type: 'daily', date: today };
    } else if (type === 'yearly') {
        filter = { type: 'yearly', year: currentYear };
    } else {
        filter = { type: 'overall' };
    }

    try {
        await Stats.findOneAndUpdate(
            filter,
            { $inc: { [incrementField]: 1 } },
            { upsert: true, new: true }
        );
        logger.info(`Stats updated successfully for ${type}.`);
    } catch (err) {
        logger.error(`Failed to update stats for ${type}. Reason: ${err.message}`);
    }
};

const incrementPostStats = async (req, res, next) => {
    await updateStats('overall', 'total_posts');
    await updateStats('daily', 'total_posts');
    await updateStats('yearly', 'total_posts');
    next();
};

const incrementVisitorStats = async (req, res, next) => {
    await updateStats('overall', 'total_visitors');
    await updateStats('daily', 'total_visitors');
    await updateStats('yearly', 'total_visitors');
    next();
};

const incrementBlogReadsStats = async (req, res, next) => {
    await updateStats('overall', 'blog_reads');
    await updateStats('daily', 'blog_reads');
    await updateStats('yearly', 'blog_reads');
    next();
};

const ensureStatsEntryExists = async (req, res, next) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));

    try {
        // Check for daily entry
        let dailyStats = await Stats.findOne({ type: 'daily', date: startOfDay });
        if (!dailyStats) {
            dailyStats = new Stats({ type: 'daily', date: startOfDay });
            await dailyStats.save();
            logger.info('Daily stats entry created successfully.');
        }

        // Check for yearly entry
        let yearlyStats = await Stats.findOne({ type: 'yearly', year: currentYear });
        if (!yearlyStats) {
            yearlyStats = new Stats({ type: 'yearly', year: currentYear });
            await yearlyStats.save();
            logger.info('Yearly stats entry created successfully.');
        }

        next();
    } catch (err) {
        const message = `Failed to ensure stats entry. Reason: ${err.message}`;
        logger.error(message);
        return next(err);
    }
};

module.exports = {
    updateStats,
    incrementPostStats,
    incrementVisitorStats,
    incrementBlogReadsStats,
    ensureStatsEntryExists
};
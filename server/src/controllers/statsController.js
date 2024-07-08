const Stats = require('../models/stats.models');
const ApiResponse = require('../utils/api/apiResponse');
const logger = require('../utils/logger');

// Fetch all stats
exports.getAllStats = async (req, res, next) => {
    try {
        const stats = await Stats.find();

        logger.info('All stats fetched successfully.');

        const response = new ApiResponse(200, stats);
        return res.status(200).json(response);

    } catch (err) {
        const message = `Failed to fetch all stats. Reason: ${err.message}`;
        logger.error(message);
        return next(err);
    }
};

// Fetch daily stats
exports.getDailyStats = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dailyStats = await Stats.findOne({
            type: 'daily',
            date: today
        });

        if (!dailyStats) {
            const message = 'No daily stats found for today.';
            logger.warn(message);
            const response = new ApiResponse(404, null, message);
            return res.status(404).json(response);
        }

        logger.info('Daily stats fetched successfully.');

        const response = new ApiResponse(200, dailyStats);
        return res.status(200).json(response);

    } catch (err) {
        const message = `Failed to fetch daily stats. Reason: ${err.message}`;
        logger.error(message);
        return next(err);
    }
};

// Fetch yearly stats
exports.getYearlyStats = async (req, res, next) => {
    try {
        const currentYear = new Date().getFullYear();

        const yearlyStats = await Stats.findOne({
            type: 'yearly',
            year: currentYear
        });

        if (!yearlyStats) {
            const message = 'No yearly stats found for the current year.';
            logger.warn(message);
            const response = new ApiResponse(404, null, message);
            return res.status(404).json(response);
        }

        logger.info('Yearly stats fetched successfully.');

        const response = new ApiResponse(200, yearlyStats);
        return res.status(200).json(response);

    } catch (err) {
        const message = `Failed to fetch yearly stats. Reason: ${err.message}`;
        logger.error(message);
        return next(err);
    }
};
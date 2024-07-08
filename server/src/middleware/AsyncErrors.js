/**
 * Wraps an asynchronous request handler function to catch any errors and pass them to the next middleware.
 * @param {Function} requestHandler - The asynchronous request handler function.
 * @returns {Function} - A middleware function that handles asynchronous errors.
 */
const logger = require('../utils/logger');

const asyncErrors = (requestHandler) => {
    return (req, res, next) => {
        try {
            Promise.resolve(requestHandler(req, res, next)).catch(next);
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };
};

module.exports = asyncErrors;

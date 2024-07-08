const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDatabase = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.DB_URI}`
        );
        logger.info(
            `Successfully connected to database. Host: ${connectionInstance.connection.host}`
        );
        return connectionInstance;
    } catch (error) {
        const message = `Failed to connect to database. Reason ${error}`;
        logger.error(message);
        throw error;
    }
};

module.exports = connectDatabase;
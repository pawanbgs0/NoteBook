const logger = require('../logger');
const mongoose = require('mongoose');

exports.isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

exports.isIdExists = async (model, id) => {
    try {
        const exists = await model.exists({ _id: id });
        logger.info(`Object Fetched: ${exists}`);
        return exists;
    } catch (error) {
        logger.error(`Object with ${_id} in model ${model} not Found.`);
        return false;
    }
};

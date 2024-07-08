/**
 * Creates an instance of ApiError.
 * @param {number} statusCode - The status code of the error.
 * @param {string} [message='Something went wrong.'] - The error message (optional).
 * @param {Array} [errors=[]] - Additional errors associated with the error (optional).
 * @param {string} [stack=''] - The stack trace of the error (optional).
 */

class ApiError extends Error {
    constructor(
        statusCode,
        message = 'Something went wrong.',
        errors = [],
        stack = ''
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

module.exports = ApiError;

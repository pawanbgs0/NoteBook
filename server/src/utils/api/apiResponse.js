/**
 * Creates an instance of ApiResponse.
 * @param {number} statusCode - The status code of the response.
 * @param {any} [data] - The data included in the response (optional).
 * @param {string} [message="Success"] - The message included in the response (optional).
 */
class ApiResponse {
    constructor(statusCode, data, message = 'Success') {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

module.exports = ApiResponse;

const winston = require('winston');
const path = require('path');
const { format } = require('logform');

/**
 * Winston logger configuration for logging to console and files.
 * @module logger
 */

// Custom format to add filename and line number
const customFormat = format((info, opts) => {
    const stack = new Error().stack.split('\n');
    const stackLine = stack[10] || stack[4]; // Adjust this based on your stack trace depth
    const match = stackLine.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/) || stackLine.match(/at\s+(.*)\s+(.*):(\d+):(\d+)/);
    if (match) {
        const filePath = match[2];
        const fileName = path.basename(filePath);
        info.fileName = fileName;
        info.lineNumber = match[3];
    } else {
        info.fileName = 'unknown';
        info.lineNumber = 'unknown';
    }
    return info;
});

const logFormat = winston.format.combine(
    customFormat(),
    winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
    winston.format.printf(
        (info) => {
            if (info.stack) {
                return `[${info.fileName}:${info.lineNumber}] - ${info.timestamp} ${info.level}: ${info.message}\n${info.stack}`;
            }
            return `[${info.fileName}:${info.lineNumber}] - ${info.timestamp} ${info.level}: ${info.message}`;
        }
    )
);

const logDirectory = ''; // Specify your log directory path here if needed

const consoleAndFileTransport = [
    new winston.transports.Console({
        level: 'info',
    }),
    new winston.transports.File({
        filename: path.join(logDirectory, 'notebookDebug.log'),
        level: 'debug',
    }),
    new winston.transports.File({
        filename: path.join(logDirectory, 'notebookError.log'),
        level: 'error',
    }),
];

const errorConsoleTransport = new winston.transports.Console({
    level: 'error',
});

const logger = winston.createLogger({
    format: logFormat,
    transports: [...consoleAndFileTransport, errorConsoleTransport],
});

module.exports = logger;
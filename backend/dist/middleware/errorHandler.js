"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../config/logger");
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error(err.message || 'Internal Server Error', { stack: err.stack, requestId: req.headers['x-request-id'] });
    const statusCode = err.statusCode || 500;
    if (err.name === 'ZodError') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid request data',
                details: err.errors
            }
        });
    }
    res.status(statusCode).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_SERVER_ERROR',
            message: statusCode === 500 ? 'An unexpected error occurred' : err.message
        }
    });
};
exports.errorHandler = errorHandler;

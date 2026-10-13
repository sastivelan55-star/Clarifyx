"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobQueue = exports.JobQueue = void 0;
/**
 * JobQueue Abstraction
 * Currently uses an in-memory execution for development/prototype.
 * Designed to be swapped with Redis + BullMQ for production.
 */
const logger_1 = require("../../config/logger");
class JobQueue {
    handlers = new Map();
    registerHandler(queueName, handler) {
        this.handlers.set(queueName, handler);
    }
    async addJob(queueName, payload) {
        const handler = this.handlers.get(queueName);
        if (!handler) {
            throw new Error(`No handler registered for queue: ${queueName}`);
        }
        // In-memory async execution (DO NOT await here to act as a background queue)
        setImmediate(async () => {
            try {
                await handler(payload);
            }
            catch (error) {
                logger_1.logger.error(`Job failed in queue ${queueName}:`, error);
                // Ideally update the scan status to FAILED in the DB here
            }
        });
    }
}
exports.JobQueue = JobQueue;
exports.jobQueue = new JobQueue();

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const database_1 = require("./config/database");
const mongodb_1 = require("./config/mongodb");
require("./models");
const startServer = async () => {
    try {
        try {
            await database_1.sequelize.authenticate();
            logger_1.logger.info('Connected to the database');
            await database_1.sequelize.sync({ alter: true });
            logger_1.logger.info('Database models synced');
        }
        catch (dbErr) {
            logger_1.logger.warn(`Primary database connection warning: ${dbErr.message}. Operational fallback active.`);
        }
        // Connect to MongoDB if configured
        try {
            await (0, mongodb_1.connectMongoDB)();
        }
        catch (mongoErr) {
            logger_1.logger.info('MongoDB optional connection skipped.');
        }
        const server = app_1.default.listen(env_1.env.PORT, () => {
            logger_1.logger.info(`ClarifyX Backend running in ${env_1.env.NODE_ENV} mode on port ${env_1.env.PORT}`);
        });
        const shutdown = async () => {
            logger_1.logger.info('Shutting down server...');
            server.close();
            try {
                await database_1.sequelize.close();
            }
            catch (e) { }
            process.exit(0);
        };
        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();

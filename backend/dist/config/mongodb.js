"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongoDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("./logger");
const connectMongoDB = async (uri) => {
    const mongoUri = uri || process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!mongoUri || (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://'))) {
        logger_1.logger.info('MongoDB URI not provided or not a MongoDB connection string. Skipping Mongoose auto-connect.');
        return null;
    }
    try {
        const conn = await mongoose_1.default.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });
        logger_1.logger.info(`MongoDB connected: ${conn.connection.host}`);
        return conn;
    }
    catch (error) {
        logger_1.logger.warn(`MongoDB connection attempt failed: ${error.message}`);
        return null;
    }
};
exports.connectMongoDB = connectMongoDB;

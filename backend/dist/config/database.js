"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = exports.createSequelizeInstance = void 0;
const sequelize_1 = require("sequelize");
const path_1 = __importDefault(require("path"));
const env_1 = require("./env");
const logger_1 = require("./logger");
const createSequelizeInstance = () => {
    // If explicitly configured for postgres
    if (process.env.USE_POSTGRES === 'true' && env_1.env.DATABASE_URL && env_1.env.DATABASE_URL.startsWith('postgres')) {
        try {
            logger_1.logger.info('Connecting to PostgreSQL database...');
            return new sequelize_1.Sequelize(env_1.env.DATABASE_URL, {
                logging: false,
                dialect: 'postgres',
                pool: {
                    max: 5,
                    min: 0,
                    acquire: 3000,
                    idle: 10000,
                },
            });
        }
        catch (e) {
            logger_1.logger.warn('Postgres connection failed, falling back to local storage');
        }
    }
    // Check for serverless runtime (Vercel / AWS Lambda) where native sqlite3 binary is unavailable
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    if (isServerless) {
        // In serverless without active PostgreSQL, initialize pure-JS postgres dialect with placeholder.
        // 'pg' is 100% pure JS and prevents native sqlite3 binding errors.
        logger_1.logger.info('Using serverless pure-JS database dialect');
        return new sequelize_1.Sequelize(env_1.env.DATABASE_URL || 'postgres://localhost:5432/clarifyx_dev', {
            dialect: 'postgres',
            logging: false,
            pool: { max: 1, min: 0, idle: 1000 },
        });
    }
    // SQLite storage for standard local node environments
    const storagePath = path_1.default.join(process.cwd(), 'clarifyx_dev.sqlite');
    logger_1.logger.info(`Using SQLite storage at: ${storagePath}`);
    return new sequelize_1.Sequelize({
        dialect: 'sqlite',
        storage: storagePath,
        logging: false,
    });
};
exports.createSequelizeInstance = createSequelizeInstance;
exports.sequelize = (0, exports.createSequelizeInstance)();

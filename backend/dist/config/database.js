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
const os_1 = __importDefault(require("os"));
const createSequelizeInstance = () => {
    // If explicitly configured for postgres and not test environment
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
            logger_1.logger.warn('Postgres connection failed, falling back to SQLite storage');
        }
    }
    // SQLite storage: zero external dependencies, robust and self-contained
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    const storageDir = isServerless ? os_1.default.tmpdir() : process.cwd();
    const storagePath = path_1.default.join(storageDir, 'clarifyx_dev.sqlite');
    logger_1.logger.info(`Using SQLite storage at: ${storagePath}`);
    return new sequelize_1.Sequelize({
        dialect: 'sqlite',
        storage: storagePath,
        logging: false,
    });
};
exports.createSequelizeInstance = createSequelizeInstance;
exports.sequelize = (0, exports.createSequelizeInstance)();

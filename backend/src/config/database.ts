import { Sequelize } from 'sequelize';
import path from 'path';
import { env } from './env';
import { logger } from './logger';

import os from 'os';

export const createSequelizeInstance = () => {
  // If explicitly configured for postgres
  if (process.env.USE_POSTGRES === 'true' && env.DATABASE_URL && env.DATABASE_URL.startsWith('postgres')) {
    try {
      logger.info('Connecting to PostgreSQL database...');
      return new Sequelize(env.DATABASE_URL, {
        logging: false,
        dialect: 'postgres',
        pool: {
          max: 5,
          min: 0,
          acquire: 3000,
          idle: 10000,
        },
      });
    } catch (e: any) {
      logger.warn('Postgres connection failed, falling back to local storage');
    }
  }

  // Check for serverless runtime (Vercel / AWS Lambda) where native sqlite3 binary is unavailable
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (isServerless) {
    // In serverless without active PostgreSQL, initialize pure-JS postgres dialect with placeholder.
    // 'pg' is 100% pure JS and prevents native sqlite3 binding errors.
    logger.info('Using serverless pure-JS database dialect');
    return new Sequelize(env.DATABASE_URL || 'postgres://localhost:5432/clarifyx_dev', {
      dialect: 'postgres',
      logging: false,
      pool: { max: 1, min: 0, idle: 1000 },
    });
  }

  // SQLite storage for standard local node environments
  const storagePath = path.join(process.cwd(), 'clarifyx_dev.sqlite');
  logger.info(`Using SQLite storage at: ${storagePath}`);
  return new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
  });
};

export const sequelize = createSequelizeInstance();

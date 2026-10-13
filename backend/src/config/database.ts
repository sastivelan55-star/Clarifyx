import { Sequelize } from 'sequelize';
import path from 'path';
import { env } from './env';
import { logger } from './logger';

import os from 'os';

export const createSequelizeInstance = () => {
  // If explicitly configured for postgres and not test environment
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
    } catch (e) {
      logger.warn('Postgres connection failed, falling back to SQLite storage');
    }
  }

  // SQLite storage: zero external dependencies, robust and self-contained
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const storageDir = isServerless ? os.tmpdir() : process.cwd();
  const storagePath = path.join(storageDir, 'clarifyx_dev.sqlite');
  logger.info(`Using SQLite storage at: ${storagePath}`);
  return new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
  });
};

export const sequelize = createSequelizeInstance();

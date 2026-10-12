import { Sequelize } from 'sequelize';
import path from 'path';
import { env } from './env';
import { logger } from './logger';

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
  const storagePath = path.join(process.cwd(), 'clarifyx_dev.sqlite');
  logger.info(`Using SQLite storage at: ${storagePath}`);
  return new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
  });
};

export const sequelize = createSequelizeInstance();

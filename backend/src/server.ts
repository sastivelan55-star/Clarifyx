import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { sequelize } from './config/database';
import { connectMongoDB } from './config/mongodb';
import './models';

const startServer = async () => {
  try {
    try {
      await sequelize.authenticate();
      logger.info('Connected to the database');
      await sequelize.sync({ alter: true });
      logger.info('Database models synced');
    } catch (dbErr: any) {
      logger.warn(`Primary database connection warning: ${dbErr.message}. Operational fallback active.`);
    }

    // Connect to MongoDB if configured
    try {
      await connectMongoDB();
    } catch (mongoErr: any) {
      logger.info('MongoDB optional connection skipped.');
    }

    const server = app.listen(env.PORT, () => {
      logger.info(`ClarifyX Backend running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

    const shutdown = async () => {
      logger.info('Shutting down server...');
      server.close();
      try {
        await sequelize.close();
      } catch (e) {}
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

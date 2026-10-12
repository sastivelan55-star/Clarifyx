import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { sequelize } from './config/database';
import './models';

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connected to the database');

    // Sync database (for development only!)
    // In production, migrations should be used.
    if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
      await sequelize.sync({ alter: true });
      logger.info('Database synced');
    }

    const server = app.listen(env.PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

    const shutdown = async () => {
      logger.info('Shutting down server...');
      server.close();
      await sequelize.close();
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

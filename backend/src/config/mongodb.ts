import mongoose from 'mongoose';
import { logger } from './logger';

export const connectMongoDB = async (uri?: string) => {
  const mongoUri = uri || process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!mongoUri || (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://'))) {
    logger.info('MongoDB URI not provided or not a MongoDB connection string. Skipping Mongoose auto-connect.');
    return null;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error: any) {
    logger.warn(`MongoDB connection attempt failed: ${error.message}`);
    return null;
  }
};

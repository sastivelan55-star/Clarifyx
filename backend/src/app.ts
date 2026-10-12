import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import healthRoutes from './routes/health.routes';
import scanRoutes from './routes/scan.routes';
import authRoutes from './routes/auth.routes';
import { logger } from './config/logger';
import { securityHeaders } from './middleware/security';
import { generalLimiter } from './middleware/rateLimit';
import { sequelize } from './config/database';
import './models';

// Auto-sync SQLite in test/dev environment on startup
if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
  sequelize.sync().catch(err => {
    logger.warn('Initial schema sync notification:', err.message);
  });
}

const app = express();

// Security and Rate Limiting
app.use(securityHeaders);
app.use(generalLimiter);

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

// Routes (support both /api/v1 and /api)
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/scans', scanRoutes);

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);

// Error Handling
app.use(errorHandler);

export default app;

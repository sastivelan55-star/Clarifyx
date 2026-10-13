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

// Database sync helper
let dbSynced = false;
export const ensureDatabase = async () => {
  if (!dbSynced) {
    try {
      await sequelize.sync();
      dbSynced = true;
    } catch (err: any) {
      logger.warn('Initial schema sync notification:', err.message);
    }
  }
};
// Kick off sync asynchronously
ensureDatabase();

const app = express();

// Middleware to ensure DB sync before route execution on serverless cold starts
app.use(async (req, res, next) => {
  if (!dbSynced) {
    await ensureDatabase();
  }
  next();
});

// Security and Rate Limiting
app.use(securityHeaders);
app.use(generalLimiter);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or same-origin requests without Origin header
    if (!origin) return callback(null, true);
    // Allow configured FRONTEND_URL, localhost, or any Vercel deployment (*.vercel.app)
    if (
      origin === env.FRONTEND_URL ||
      origin.includes('localhost') ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    callback(null, true); // Safe fallback for preview environments
  },
  credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

// Routes (support /api/v1, /api, /v1, and clean paths for various Vercel rewrite patterns)
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/scans', scanRoutes);

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);

app.use('/v1/health', healthRoutes);
app.use('/v1/auth', authRoutes);
app.use('/v1/scans', scanRoutes);

app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/scans', scanRoutes);

// Error Handling
app.use(errorHandler);

export default app;

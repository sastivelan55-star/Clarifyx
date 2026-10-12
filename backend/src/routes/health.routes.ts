import { Router, Request, Response } from 'express';
import { sequelize } from '../config/database';
import { logger } from '../config/logger';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    await sequelize.authenticate();
    dbStatus = 'connected';
  } catch (error: any) {
    logger.warn('Health check DB ping warning:', error.message);
  }

  // Always return 200 for server liveness, detailing individual service states
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      api: 'operational',
      database: dbStatus,
      scanners: {
        url: 'HEURISTIC',
        message: 'HEURISTIC',
        image: 'SANDBOX_PROTOTYPE',
        video: 'ASYNC_QUEUE',
        voice: 'AUDIO_SANDBOX',
        fake_news: 'HEURISTIC',
      }
    }
  });
});

export default router;

import { Router, Request, Response } from 'express';
import { sequelize } from '../config/database';
import { logger } from '../config/logger';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    
    res.status(200).json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected'
      }
    });
  } catch (error: any) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected'
      }
    });
  }
});

export default router;

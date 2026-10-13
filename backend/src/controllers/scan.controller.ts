import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Scan, Result } from '../models';
import { scanOrchestrator } from '../services/scanning/ScanOrchestrator';
import { FileValidationService } from '../utils/fileSecurity';
import { logger } from '../config/logger';

const SyncScanTypeEnum = z.enum(['URL', 'MESSAGE', 'FAKE_NEWS']);

export const createSyncScanSchema = z.object({
  body: z.object({
    scanType: SyncScanTypeEnum,
    input: z.string().min(1, "Input is required"),
  })
});

export const createSyncScan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { scanType, input } = req.body;
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000001'; 

    let scan: any = null;
    try {
      scan = await Scan.create({
        userId,
        scanType,
        status: 'PENDING',
      });
    } catch (dbErr: any) {
      logger.warn('Scan database record creation skipped (offline/in-memory mode):', dbErr.message);
    }

    if (scan) {
      await scanOrchestrator.executeSyncScan(scan.id, scanType, input);
      
      const updatedScan = await Scan.findByPk(scan.id, { include: [Result] });
      const jsonOutput: any = updatedScan ? updatedScan.toJSON() : scan.toJSON();
      if (jsonOutput.Result && !jsonOutput.result) {
        jsonOutput.result = jsonOutput.Result;
      }

      return res.status(201).json({
        success: true,
        data: jsonOutput
      });
    }

    // Direct synchronous scan execution fallback when database is disconnected on serverless
    let scanResult: any;
    if (scanType === 'URL') {
      const { urlScanner } = await import('../services/scanning/UrlScanner');
      scanResult = await urlScanner.scan(input);
    } else if (scanType === 'MESSAGE') {
      const { messageScanner } = await import('../services/scanning/MessageScanner');
      scanResult = await messageScanner.scan(input);
    } else {
      const { fakeNewsScanner } = await import('../services/scanning/MediaScanners');
      scanResult = await fakeNewsScanner.scan(input);
    }

    const fallbackOutput = {
      id: uuidv4(),
      userId,
      scanType,
      status: 'COMPLETED',
      riskScore: scanResult.score,
      verdict: scanResult.level,
      completedAt: new Date(),
      Result: {
        data: {
          score: scanResult.score,
          level: scanResult.level,
          verdict: scanResult.verdict,
          confidence: scanResult.confidence,
          indicators: scanResult.indicators,
          recommendation: scanResult.recommendation,
          mode: scanResult.mode
        }
      },
      result: {
        data: {
          score: scanResult.score,
          level: scanResult.level,
          verdict: scanResult.verdict,
          confidence: scanResult.confidence,
          indicators: scanResult.indicators,
          recommendation: scanResult.recommendation,
          mode: scanResult.mode
        }
      }
    };

    return res.status(201).json({
      success: true,
      data: fallbackOutput
    });
  } catch (error) {
    next(error);
  }
};

export const createMediaScan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const scanType = req.body.scanType;
    if (!['IMAGE', 'VIDEO', 'VOICE'].includes(scanType)) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid scanType for media.' } });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'File is required.' } });
    }

    // Explicit file type and size validation
    if (scanType === 'IMAGE') {
      try {
        FileValidationService.validateImage(req.file.mimetype, req.file.size);
      } catch (valErr: any) {
        return res.status(400).json({
          success: false,
          error: {
            code: valErr.message.startsWith('FILE_TOO_LARGE') ? 'FILE_TOO_LARGE' : 'UNSUPPORTED_FILE',
            message: valErr.message
          }
        });
      }
    } else if (scanType === 'VIDEO') {
      try {
        FileValidationService.validateVideo(req.file.mimetype, req.file.size);
      } catch (valErr: any) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: valErr.message }
        });
      }
    } else if (scanType === 'VOICE') {
      try {
        FileValidationService.validateAudio(req.file.mimetype, req.file.size);
      } catch (valErr: any) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: valErr.message }
        });
      }
    }

    const userId = req.user?.id || '00000000-0000-0000-0000-000000000001'; 
    
    let scan: any = null;
    try {
      scan = await Scan.create({
        userId,
        scanType,
        status: 'PENDING',
      });
    } catch (dbErr: any) {
      logger.warn('Scan DB record creation skipped (offline/in-memory mode):', dbErr.message);
    }

    if (scan) {
      // Execute scan directly to ensure completion before serverless function terminates
      await scanOrchestrator.executeMediaScan(scan.id, scanType, req.file.filename);

      const updatedScan = await Scan.findByPk(scan.id, { include: [Result] });
      const jsonOutput: any = updatedScan ? updatedScan.toJSON() : scan.toJSON();
      if (jsonOutput.Result && !jsonOutput.result) {
        jsonOutput.result = jsonOutput.Result;
      }

      return res.status(201).json({
        success: true,
        data: jsonOutput
      });
    }

    // Direct analysis fallback when database storage is offline on serverless
    const { imageScanner, videoScanner, voiceScanner } = await import('../services/scanning/MediaScanners');
    let scanResult: any;
    if (scanType === 'IMAGE') scanResult = await imageScanner.scan(req.file.filename);
    else if (scanType === 'VIDEO') scanResult = await videoScanner.scan(req.file.filename);
    else scanResult = await voiceScanner.scan(req.file.filename);

    const fallbackScanOutput = {
      id: uuidv4(),
      userId,
      scanType,
      status: 'COMPLETED',
      riskScore: scanResult.score,
      verdict: scanResult.level,
      completedAt: new Date(),
      Result: {
        data: {
          score: scanResult.score,
          level: scanResult.level,
          verdict: scanResult.verdict,
          confidence: scanResult.confidence,
          indicators: scanResult.indicators,
          recommendation: scanResult.recommendation,
          mode: scanResult.mode
        }
      },
      result: {
        data: {
          score: scanResult.score,
          level: scanResult.level,
          verdict: scanResult.verdict,
          confidence: scanResult.confidence,
          indicators: scanResult.indicators,
          recommendation: scanResult.recommendation,
          mode: scanResult.mode
        }
      }
    };

    return res.status(201).json({
      success: true,
      data: fallbackScanOutput
    });
  } catch (error) {
    next(error);
  }
};

export const getScans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const scans = await Scan.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 50,
      include: [Result]
    });

    res.status(200).json({ success: true, data: scans });
  } catch (error) {
    next(error);
  }
};

export const getScanById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;
    const scan = await Scan.findOne({ 
      where: { id, userId },
      include: [Result] 
    });

    if (!scan) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Scan not found' } });
    }

    res.status(200).json({ success: true, data: scan });
  } catch (error) {
    next(error);
  }
};

export const deleteScan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;
    const scan = await Scan.findOne({ where: { id, userId } });
    
    if (!scan) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Scan not found' } });
    }

    await scan.destroy();
    res.status(200).json({ success: true, data: { id } });
  } catch (error) {
    next(error);
  }
};

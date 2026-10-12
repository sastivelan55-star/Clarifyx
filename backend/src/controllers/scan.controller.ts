import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Scan, Result } from '../models';
import { scanOrchestrator } from '../services/scanning/ScanOrchestrator';

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
    const userId = req.user!.id; 

    const scan = await Scan.create({
      userId,
      scanType,
      status: 'PENDING',
    });

    await scanOrchestrator.executeSyncScan(scan.id, scanType, input);
    
    // Reload scan to get updated status/results
    const updatedScan = await Scan.findByPk(scan.id, { include: [Result] });
    const jsonOutput: any = updatedScan ? updatedScan.toJSON() : scan.toJSON();
    if (jsonOutput.Result && !jsonOutput.result) {
      jsonOutput.result = jsonOutput.Result;
    }

    res.status(201).json({
      success: true,
      data: jsonOutput
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

    const userId = req.user!.id; 
    
    const scan = await Scan.create({
      userId,
      scanType,
      status: 'PENDING',
    });

    // The file has already been saved to storage by Multer middleware
    // req.file.filename corresponds to the key in our StorageProvider if configured as such
    await scanOrchestrator.queueMediaScan(scan.id, scanType, req.file.filename);

    res.status(202).json({
      success: true,
      data: scan
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

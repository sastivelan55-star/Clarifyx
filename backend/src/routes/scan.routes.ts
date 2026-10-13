import { Router, Request } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { createSyncScan, createMediaScan, getScans, getScanById, deleteScan, createSyncScanSchema } from '../controllers/scan.controller';
import { scanLimiter, uploadLimiter } from '../middleware/rateLimit';
import { FileValidationService } from '../utils/fileSecurity';

import os from 'os';
import fs from 'fs';

const router = Router();

const getUploadDir = () => {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const dir = isServerless
    ? path.join(os.tmpdir(), 'temp_uploads')
    : path.join(process.cwd(), 'temp_uploads');
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (e) {}
  }
  return dir;
};

// Configure multer for temp local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadDir());
  },
  filename: (req, file, cb) => {
    const ext = FileValidationService.getSafeExtension(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max cap (fine-grained validation in service)
});

// Apply requireAuth to all scan routes
router.use(requireAuth);

// Create text-based scans
router.post('/', scanLimiter, validate(createSyncScanSchema), createSyncScan);

// Create media-based scans (async)
router.post('/media', uploadLimiter, upload.single('file'), createMediaScan);

// View history and specific scans
router.get('/', getScans);
router.get('/:id', getScanById);
router.delete('/:id', deleteScan);

export default router;

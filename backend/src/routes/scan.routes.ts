import { Router, Request } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { createSyncScan, createMediaScan, getScans, getScanById, deleteScan, createSyncScanSchema } from '../controllers/scan.controller';
import { scanLimiter, uploadLimiter } from '../middleware/rateLimit';
import { FileValidationService } from '../utils/fileSecurity';

const router = Router();

// Configure multer for temp local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'temp_uploads'));
  },
  filename: (req, file, cb) => {
    const ext = FileValidationService.getSafeExtension(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB absolute max (fine-grained validation in service)
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

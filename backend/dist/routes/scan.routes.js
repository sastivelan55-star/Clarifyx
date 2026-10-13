"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const scan_controller_1 = require("../controllers/scan.controller");
const rateLimit_1 = require("../middleware/rateLimit");
const fileSecurity_1 = require("../utils/fileSecurity");
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
const getUploadDir = () => {
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    const dir = isServerless
        ? path_1.default.join(os_1.default.tmpdir(), 'temp_uploads')
        : path_1.default.join(process.cwd(), 'temp_uploads');
    if (!fs_1.default.existsSync(dir)) {
        try {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        catch (e) { }
    }
    return dir;
};
// Configure multer for temp local storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, getUploadDir());
    },
    filename: (req, file, cb) => {
        const ext = fileSecurity_1.FileValidationService.getSafeExtension(file.originalname);
        cb(null, `${(0, uuid_1.v4)()}${ext}`);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB max cap (fine-grained validation in service)
});
// Apply requireAuth to all scan routes
router.use(auth_1.requireAuth);
// Create text-based scans
router.post('/', rateLimit_1.scanLimiter, (0, validate_1.validate)(scan_controller_1.createSyncScanSchema), scan_controller_1.createSyncScan);
// Create media-based scans (async)
router.post('/media', rateLimit_1.uploadLimiter, upload.single('file'), scan_controller_1.createMediaScan);
// View history and specific scans
router.get('/', scan_controller_1.getScans);
router.get('/:id', scan_controller_1.getScanById);
router.delete('/:id', scan_controller_1.deleteScan);
exports.default = router;

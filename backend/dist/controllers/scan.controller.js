"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteScan = exports.getScanById = exports.getScans = exports.createMediaScan = exports.createSyncScan = exports.createSyncScanSchema = void 0;
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const models_1 = require("../models");
const ScanOrchestrator_1 = require("../services/scanning/ScanOrchestrator");
const fileSecurity_1 = require("../utils/fileSecurity");
const logger_1 = require("../config/logger");
const SyncScanTypeEnum = zod_1.z.enum(['URL', 'MESSAGE', 'FAKE_NEWS']);
exports.createSyncScanSchema = zod_1.z.object({
    body: zod_1.z.object({
        scanType: SyncScanTypeEnum,
        input: zod_1.z.string().min(1, "Input is required"),
    })
});
const createSyncScan = async (req, res, next) => {
    try {
        const { scanType, input } = req.body;
        const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
        let scan = null;
        try {
            scan = await models_1.Scan.create({
                userId,
                scanType,
                status: 'PENDING',
            });
        }
        catch (dbErr) {
            logger_1.logger.warn('Scan database record creation skipped (offline/in-memory mode):', dbErr.message);
        }
        if (scan) {
            await ScanOrchestrator_1.scanOrchestrator.executeSyncScan(scan.id, scanType, input);
            const updatedScan = await models_1.Scan.findByPk(scan.id, { include: [models_1.Result] });
            const jsonOutput = updatedScan ? updatedScan.toJSON() : scan.toJSON();
            if (jsonOutput.Result && !jsonOutput.result) {
                jsonOutput.result = jsonOutput.Result;
            }
            return res.status(201).json({
                success: true,
                data: jsonOutput
            });
        }
        // Direct synchronous scan execution fallback when database is disconnected on serverless
        let scanResult;
        if (scanType === 'URL') {
            const { urlScanner } = await Promise.resolve().then(() => __importStar(require('../services/scanning/UrlScanner')));
            scanResult = await urlScanner.scan(input);
        }
        else if (scanType === 'MESSAGE') {
            const { messageScanner } = await Promise.resolve().then(() => __importStar(require('../services/scanning/MessageScanner')));
            scanResult = await messageScanner.scan(input);
        }
        else {
            const { fakeNewsScanner } = await Promise.resolve().then(() => __importStar(require('../services/scanning/MediaScanners')));
            scanResult = await fakeNewsScanner.scan(input);
        }
        const fallbackOutput = {
            id: (0, uuid_1.v4)(),
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
    }
    catch (error) {
        next(error);
    }
};
exports.createSyncScan = createSyncScan;
const createMediaScan = async (req, res, next) => {
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
                fileSecurity_1.FileValidationService.validateImage(req.file.mimetype, req.file.size);
            }
            catch (valErr) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: valErr.message.startsWith('FILE_TOO_LARGE') ? 'FILE_TOO_LARGE' : 'UNSUPPORTED_FILE',
                        message: valErr.message
                    }
                });
            }
        }
        else if (scanType === 'VIDEO') {
            try {
                fileSecurity_1.FileValidationService.validateVideo(req.file.mimetype, req.file.size);
            }
            catch (valErr) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: valErr.message }
                });
            }
        }
        else if (scanType === 'VOICE') {
            try {
                fileSecurity_1.FileValidationService.validateAudio(req.file.mimetype, req.file.size);
            }
            catch (valErr) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: valErr.message }
                });
            }
        }
        const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
        let scan = null;
        try {
            scan = await models_1.Scan.create({
                userId,
                scanType,
                status: 'PENDING',
            });
        }
        catch (dbErr) {
            logger_1.logger.warn('Scan DB record creation skipped (offline/in-memory mode):', dbErr.message);
        }
        if (scan) {
            // Execute scan directly to ensure completion before serverless function terminates
            await ScanOrchestrator_1.scanOrchestrator.executeMediaScan(scan.id, scanType, req.file.filename);
            const updatedScan = await models_1.Scan.findByPk(scan.id, { include: [models_1.Result] });
            const jsonOutput = updatedScan ? updatedScan.toJSON() : scan.toJSON();
            if (jsonOutput.Result && !jsonOutput.result) {
                jsonOutput.result = jsonOutput.Result;
            }
            return res.status(201).json({
                success: true,
                data: jsonOutput
            });
        }
        // Direct analysis fallback when database storage is offline on serverless
        const { imageScanner, videoScanner, voiceScanner } = await Promise.resolve().then(() => __importStar(require('../services/scanning/MediaScanners')));
        let scanResult;
        if (scanType === 'IMAGE')
            scanResult = await imageScanner.scan(req.file.filename);
        else if (scanType === 'VIDEO')
            scanResult = await videoScanner.scan(req.file.filename);
        else
            scanResult = await voiceScanner.scan(req.file.filename);
        const fallbackScanOutput = {
            id: (0, uuid_1.v4)(),
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
    }
    catch (error) {
        next(error);
    }
};
exports.createMediaScan = createMediaScan;
const getScans = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const scans = await models_1.Scan.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit: 50,
            include: [models_1.Result]
        });
        res.status(200).json({ success: true, data: scans });
    }
    catch (error) {
        next(error);
    }
};
exports.getScans = getScans;
const getScanById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;
        const scan = await models_1.Scan.findOne({
            where: { id, userId },
            include: [models_1.Result]
        });
        if (!scan) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Scan not found' } });
        }
        res.status(200).json({ success: true, data: scan });
    }
    catch (error) {
        next(error);
    }
};
exports.getScanById = getScanById;
const deleteScan = async (req, res, next) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;
        const scan = await models_1.Scan.findOne({ where: { id, userId } });
        if (!scan) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Scan not found' } });
        }
        await scan.destroy();
        res.status(200).json({ success: true, data: { id } });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteScan = deleteScan;

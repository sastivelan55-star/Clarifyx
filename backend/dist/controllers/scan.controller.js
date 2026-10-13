"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteScan = exports.getScanById = exports.getScans = exports.createMediaScan = exports.createSyncScan = exports.createSyncScanSchema = void 0;
const zod_1 = require("zod");
const models_1 = require("../models");
const ScanOrchestrator_1 = require("../services/scanning/ScanOrchestrator");
const fileSecurity_1 = require("../utils/fileSecurity");
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
        const userId = req.user.id;
        const scan = await models_1.Scan.create({
            userId,
            scanType,
            status: 'PENDING',
        });
        await ScanOrchestrator_1.scanOrchestrator.executeSyncScan(scan.id, scanType, input);
        // Reload scan to get updated status/results
        const updatedScan = await models_1.Scan.findByPk(scan.id, { include: [models_1.Result] });
        const jsonOutput = updatedScan ? updatedScan.toJSON() : scan.toJSON();
        if (jsonOutput.Result && !jsonOutput.result) {
            jsonOutput.result = jsonOutput.Result;
        }
        res.status(201).json({
            success: true,
            data: jsonOutput
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
        const userId = req.user.id;
        const scan = await models_1.Scan.create({
            userId,
            scanType,
            status: 'PENDING',
        });
        // Execute scan directly to ensure completion before serverless function terminates
        await ScanOrchestrator_1.scanOrchestrator.executeMediaScan(scan.id, scanType, req.file.filename);
        const updatedScan = await models_1.Scan.findByPk(scan.id, { include: [models_1.Result] });
        const jsonOutput = updatedScan ? updatedScan.toJSON() : scan.toJSON();
        if (jsonOutput.Result && !jsonOutput.result) {
            jsonOutput.result = jsonOutput.Result;
        }
        res.status(201).json({
            success: true,
            data: jsonOutput
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

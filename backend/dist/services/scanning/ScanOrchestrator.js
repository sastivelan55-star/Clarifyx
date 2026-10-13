"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanOrchestrator = exports.ScanOrchestrator = void 0;
const UrlScanner_1 = require("./UrlScanner");
const MessageScanner_1 = require("./MessageScanner");
const MediaScanners_1 = require("./MediaScanners");
const models_1 = require("../../models");
const JobQueue_1 = require("../jobs/JobQueue");
class ScanOrchestrator {
    /**
     * Orchestrates synchronous scans (URL, Message, Fake News)
     */
    async executeSyncScan(scanId, type, target) {
        const scan = await models_1.Scan.findByPk(scanId);
        if (!scan)
            return;
        try {
            scan.status = 'PROCESSING';
            await scan.save();
            let scanResult;
            switch (type) {
                case 'URL':
                    scanResult = await UrlScanner_1.urlScanner.scan(target);
                    break;
                case 'MESSAGE':
                    scanResult = await MessageScanner_1.messageScanner.scan(target);
                    break;
                case 'FAKE_NEWS':
                    scanResult = await MediaScanners_1.fakeNewsScanner.scan(target);
                    break;
                default:
                    throw new Error('UNSUPPORTED_SYNC_SCAN_TYPE');
            }
            await this.saveResult(scan, scanResult, { target });
        }
        catch (error) {
            scan.status = 'FAILED';
            await scan.save();
            throw error;
        }
    }
    /**
     * Queues an asynchronous media scan (Image, Video, Voice)
     */
    async queueMediaScan(scanId, type, fileKey) {
        const scan = await models_1.Scan.findByPk(scanId);
        if (!scan)
            return;
        scan.status = 'PENDING'; // QUEUED
        await scan.save();
        await JobQueue_1.jobQueue.addJob('MEDIA_SCAN', { scanId, type, fileKey });
    }
    /**
     * Internal worker handler for async media scans
     */
    async executeMediaScan(scanId, type, fileKey) {
        const scan = await models_1.Scan.findByPk(scanId);
        if (!scan)
            return;
        try {
            scan.status = 'PROCESSING';
            await scan.save();
            let scanResult;
            switch (type) {
                case 'IMAGE':
                    scanResult = await MediaScanners_1.imageScanner.scan(fileKey);
                    break;
                case 'VIDEO':
                    scanResult = await MediaScanners_1.videoScanner.scan(fileKey);
                    break;
                case 'VOICE':
                    scanResult = await MediaScanners_1.voiceScanner.scan(fileKey);
                    break;
                default:
                    throw new Error('UNSUPPORTED_MEDIA_SCAN_TYPE');
            }
            await this.saveResult(scan, scanResult, { fileKey });
        }
        catch (error) {
            scan.status = 'FAILED';
            await scan.save();
            throw error;
        }
    }
    async saveResult(scan, riskResult, metadata) {
        scan.status = 'COMPLETED';
        scan.riskScore = riskResult.score;
        scan.verdict = riskResult.level;
        scan.completedAt = new Date();
        await scan.save();
        await models_1.Result.create({
            scanId: scan.id,
            data: {
                score: riskResult.score,
                level: riskResult.level,
                verdict: riskResult.verdict,
                confidence: riskResult.confidence,
                indicators: riskResult.indicators,
                recommendation: riskResult.recommendation,
                mode: riskResult.mode
            },
            metadata
        });
    }
}
exports.ScanOrchestrator = ScanOrchestrator;
exports.scanOrchestrator = new ScanOrchestrator();
// Register the worker handler
JobQueue_1.jobQueue.registerHandler('MEDIA_SCAN', async (payload) => {
    await exports.scanOrchestrator.executeMediaScan(payload.scanId, payload.type, payload.fileKey);
});

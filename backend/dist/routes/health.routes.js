"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    let dbStatus = 'disconnected';
    try {
        await database_1.sequelize.authenticate();
        dbStatus = 'connected';
    }
    catch (error) {
        logger_1.logger.warn('Health check DB ping warning:', error.message);
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
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDatabase = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const scan_routes_1 = __importDefault(require("./routes/scan.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const logger_1 = require("./config/logger");
const security_1 = require("./middleware/security");
const rateLimit_1 = require("./middleware/rateLimit");
const database_1 = require("./config/database");
require("./models");
// Database sync helper
let dbSynced = false;
const ensureDatabase = async () => {
    if (!dbSynced) {
        try {
            await database_1.sequelize.sync();
            dbSynced = true;
        }
        catch (err) {
            logger_1.logger.warn('Initial schema sync notification:', err.message);
        }
    }
};
exports.ensureDatabase = ensureDatabase;
// Kick off sync asynchronously
(0, exports.ensureDatabase)();
const app = (0, express_1.default)();
// Middleware to ensure DB sync before route execution on serverless cold starts
app.use(async (req, res, next) => {
    if (!dbSynced) {
        await (0, exports.ensureDatabase)();
    }
    next();
});
// Security and Rate Limiting
app.use(security_1.securityHeaders);
app.use(rateLimit_1.generalLimiter);
// Middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow non-browser requests or same-origin requests without Origin header
        if (!origin)
            return callback(null, true);
        // Allow configured FRONTEND_URL, localhost, or any Vercel deployment (*.vercel.app)
        if (origin === env_1.env.FRONTEND_URL ||
            origin.includes('localhost') ||
            origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        callback(null, true); // Safe fallback for preview environments
    },
    credentials: true
}));
// Request logging middleware
app.use((req, res, next) => {
    logger_1.logger.info(`Incoming Request: ${req.method} ${req.url}`);
    next();
});
// Routes (support /api/v1, /api, /v1, and clean paths for various Vercel rewrite patterns)
app.use('/api/v1/health', health_routes_1.default);
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/scans', scan_routes_1.default);
app.use('/api/health', health_routes_1.default);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/scans', scan_routes_1.default);
app.use('/v1/health', health_routes_1.default);
app.use('/v1/auth', auth_routes_1.default);
app.use('/v1/scans', scan_routes_1.default);
app.use('/health', health_routes_1.default);
app.use('/auth', auth_routes_1.default);
app.use('/scans', scan_routes_1.default);
// Error Handling
app.use(errorHandler_1.errorHandler);
exports.default = app;

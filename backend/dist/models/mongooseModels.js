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
exports.MongoScan = exports.MongoUser = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    name: { type: String },
    role: { type: String, default: 'operator' },
}, {
    timestamps: true,
});
exports.MongoUser = mongoose_1.default.models.User || mongoose_1.default.model('User', UserSchema);
const ScanSchema = new mongoose_1.Schema({
    userId: { type: String, index: true },
    scanType: {
        type: String,
        required: true,
        enum: ['URL', 'MESSAGE', 'IMAGE', 'VIDEO', 'VOICE', 'FAKE_NEWS'],
        index: true
    },
    status: {
        type: String,
        default: 'PENDING',
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']
    },
    riskScore: { type: Number, default: 0 },
    verdict: {
        type: String,
        default: 'SAFE',
        enum: ['SAFE', 'SUSPICIOUS', 'DANGEROUS', 'UNKNOWN']
    },
    targetSummary: { type: String, default: '' },
    data: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    metadata: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    completedAt: { type: Date }
}, {
    timestamps: true,
});
ScanSchema.index({ userId: 1, createdAt: -1 });
exports.MongoScan = mongoose_1.default.models.Scan || mongoose_1.default.model('Scan', ScanSchema);

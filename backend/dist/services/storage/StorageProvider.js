"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageProvider = exports.LocalStorageProvider = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const uuid_1 = require("uuid");
const logger_1 = require("../../config/logger");
class LocalStorageProvider {
    baseDir;
    constructor() {
        const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
        this.baseDir = isServerless
            ? path_1.default.join(os_1.default.tmpdir(), 'temp_uploads')
            : path_1.default.join(process.cwd(), 'temp_uploads');
        if (!fs_1.default.existsSync(this.baseDir)) {
            try {
                fs_1.default.mkdirSync(this.baseDir, { recursive: true });
            }
            catch (err) {
                logger_1.logger.warn(`Storage directory initialization notice: ${err.message}`);
            }
        }
    }
    async upload(fileBuffer, extension) {
        const key = `${(0, uuid_1.v4)()}${extension}`;
        const filePath = path_1.default.join(this.baseDir, key);
        await fs_1.default.promises.writeFile(filePath, fileBuffer);
        return key;
    }
    async download(key) {
        const filePath = path_1.default.join(this.baseDir, key);
        return fs_1.default.promises.readFile(filePath);
    }
    async delete(key) {
        const filePath = path_1.default.join(this.baseDir, key);
        if (fs_1.default.existsSync(filePath)) {
            await fs_1.default.promises.unlink(filePath);
        }
    }
    async exists(key) {
        const filePath = path_1.default.join(this.baseDir, key);
        try {
            await fs_1.default.promises.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.LocalStorageProvider = LocalStorageProvider;
exports.storageProvider = new LocalStorageProvider();

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileValidationService = void 0;
const path_1 = __importDefault(require("path"));
class FileValidationService {
    static ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
    static ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime'];
    static ALLOWED_AUDIO_MIMES = ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'];
    static MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    static MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
    static MAX_AUDIO_SIZE = 20 * 1024 * 1024; // 20MB
    static validateImage(mimeType, size) {
        if (!this.ALLOWED_IMAGE_MIMES.includes(mimeType)) {
            throw new Error(`UNSUPPORTED_FILE: Allowed image types: ${this.ALLOWED_IMAGE_MIMES.join(', ')}`);
        }
        if (size > this.MAX_IMAGE_SIZE) {
            throw new Error(`FILE_TOO_LARGE: Max image size is ${this.MAX_IMAGE_SIZE / (1024 * 1024)}MB`);
        }
    }
    static validateVideo(mimeType, size) {
        if (!this.ALLOWED_VIDEO_MIMES.includes(mimeType)) {
            throw new Error(`UNSUPPORTED_FILE: Allowed video types: ${this.ALLOWED_VIDEO_MIMES.join(', ')}`);
        }
        if (size > this.MAX_VIDEO_SIZE) {
            throw new Error(`FILE_TOO_LARGE: Max video size is ${this.MAX_VIDEO_SIZE / (1024 * 1024)}MB`);
        }
    }
    static validateAudio(mimeType, size) {
        if (!this.ALLOWED_AUDIO_MIMES.includes(mimeType)) {
            throw new Error(`UNSUPPORTED_FILE: Allowed audio types: ${this.ALLOWED_AUDIO_MIMES.join(', ')}`);
        }
        if (size > this.MAX_AUDIO_SIZE) {
            throw new Error(`FILE_TOO_LARGE: Max audio size is ${this.MAX_AUDIO_SIZE / (1024 * 1024)}MB`);
        }
    }
    static getSafeExtension(originalName) {
        const ext = path_1.default.extname(originalName).toLowerCase();
        // Basic sanitization
        if (!/^\.[a-z0-9]+$/.test(ext)) {
            return '.bin';
        }
        return ext;
    }
}
exports.FileValidationService = FileValidationService;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voiceScanner = exports.videoScanner = exports.imageScanner = exports.fakeNewsScanner = exports.VoiceScanner = exports.VideoScanner = exports.ImageScanner = exports.FakeNewsScanner = void 0;
const RiskEngine_1 = require("../risk/RiskEngine");
const StorageProvider_1 = require("../storage/StorageProvider");
class FakeNewsScanner {
    mode = 'NOT_IMPLEMENTED'; // Replaced "HEURISTIC" with honest reality
    async scan(text) {
        const signals = [
            {
                category: 'LIMITATION',
                confidence: 1.0,
                description: 'Fake News detection requires an external verification API or fact-checking database which is not configured.',
                scoreImpact: 0
            }
        ];
        const risk = RiskEngine_1.RiskEngine.calculateRisk(0, signals, 0.0);
        // Force verdict
        risk.verdict = 'UNABLE_TO_VERIFY';
        risk.level = 'UNKNOWN';
        risk.recommendation = 'Please consult a trusted fact-checking source manually.';
        return { ...risk, mode: this.mode };
    }
}
exports.FakeNewsScanner = FakeNewsScanner;
class ImageScanner {
    mode = 'DEMO_MODE'; // Honest reality
    async scan(fileKey) {
        const exists = await StorageProvider_1.storageProvider.exists(fileKey);
        if (!exists)
            throw new Error('File not found in storage');
        const signals = [
            {
                category: 'LIMITATION',
                confidence: 1.0,
                description: 'No real AI vision model is configured. Returning DEMO mode static results.',
                scoreImpact: 0
            }
        ];
        const risk = RiskEngine_1.RiskEngine.calculateRisk(0, signals, 0.0);
        risk.verdict = 'DEMO_RESULT_ONLY';
        risk.level = 'UNKNOWN';
        return { ...risk, mode: this.mode };
    }
}
exports.ImageScanner = ImageScanner;
class VideoScanner {
    mode = 'DEMO_MODE';
    async scan(fileKey) {
        const signals = [
            {
                category: 'LIMITATION',
                confidence: 1.0,
                description: 'Deepfake video detection requires a dedicated ML pipeline which is not configured.',
                scoreImpact: 0
            }
        ];
        const risk = RiskEngine_1.RiskEngine.calculateRisk(0, signals, 0.0);
        risk.verdict = 'DEMO_RESULT_ONLY';
        risk.level = 'UNKNOWN';
        return { ...risk, mode: this.mode };
    }
}
exports.VideoScanner = VideoScanner;
class VoiceScanner {
    mode = 'DEMO_MODE';
    async scan(fileKey) {
        const signals = [
            {
                category: 'LIMITATION',
                confidence: 1.0,
                description: 'AI Voice Cloning detection requires a dedicated ML model which is not configured.',
                scoreImpact: 0
            }
        ];
        const risk = RiskEngine_1.RiskEngine.calculateRisk(0, signals, 0.0);
        risk.verdict = 'DEMO_RESULT_ONLY';
        risk.level = 'UNKNOWN';
        return { ...risk, mode: this.mode };
    }
}
exports.VoiceScanner = VoiceScanner;
exports.fakeNewsScanner = new FakeNewsScanner();
exports.imageScanner = new ImageScanner();
exports.videoScanner = new VideoScanner();
exports.voiceScanner = new VoiceScanner();

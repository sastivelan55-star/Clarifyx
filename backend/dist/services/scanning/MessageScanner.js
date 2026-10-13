"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageScanner = exports.MessageScanner = exports.HeuristicMessageProvider = void 0;
const RiskEngine_1 = require("../risk/RiskEngine");
class HeuristicMessageProvider {
    mode = 'HEURISTIC';
    async analyze(text) {
        const signals = [];
        let baseScore = 5;
        const lower = text.toLowerCase();
        const patterns = [
            [/urgent|immediately|act now|expires today/i, 18, 'SOCIAL_ENGINEERING', 'Urgency language pressures the recipient to act fast.'],
            [/otp|one.?time.?password/i, 25, 'CREDENTIAL_THEFT', 'OTP request — a common account-takeover tactic.'],
            [/password|credential|pin/i, 22, 'CREDENTIAL_THEFT', 'References a password or credential.'],
            [/click here|tap here|open link/i, 18, 'PHISHING', 'Direct click prompt common in phishing messages.'],
            [/winner|won|congratulations|prize|reward/i, 18, 'SCAM', 'Prize or winner language — common scam hook.'],
            [/bank|account number|transfer|wire/i, 14, 'FINANCIAL_FRAUD', 'Financial information reference.'],
            [/verify your account|confirm your identity/i, 24, 'PHISHING', 'Account verification request — classic phishing theme.'],
            [/dear (customer|user|member)/i, 12, 'SCAM', 'Generic salutation — legitimate services typically use your name.'],
            [/\$\d+|\d+ dollars|free money/i, 16, 'SCAM', 'Monetary promise used as bait.'],
            [/suspended|blocked|restricted|limited/i, 15, 'SOCIAL_ENGINEERING', 'Account threat language to create panic.'],
        ];
        for (const [pattern, impact, category, desc] of patterns) {
            if (pattern.test(lower)) {
                signals.push({ category, confidence: 0.8, description: desc, scoreImpact: impact });
            }
        }
        if (signals.length === 0) {
            signals.push({ category: 'SAFE', confidence: 0.7, description: 'No obvious scam-language indicators found.', scoreImpact: 0 });
        }
        return { signals, baseScore, confidence: 0.75, mode: this.mode };
    }
}
exports.HeuristicMessageProvider = HeuristicMessageProvider;
const GeminiAIProvider_1 = require("./GeminiAIProvider");
class MessageScanner {
    provider;
    constructor(provider = new GeminiAIProvider_1.GeminiAIProvider()) {
        this.provider = provider;
    }
    async scan(text) {
        const { signals, baseScore, confidence, mode } = await this.provider.analyze(text);
        const risk = RiskEngine_1.RiskEngine.calculateRisk(baseScore, signals, confidence);
        return { ...risk, mode };
    }
}
exports.MessageScanner = MessageScanner;
exports.messageScanner = new MessageScanner();

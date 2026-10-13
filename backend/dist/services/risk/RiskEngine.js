"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskEngine = void 0;
/**
 * RiskEngine
 * Centralized logic for scoring and verdicts based on gathered signals.
 */
class RiskEngine {
    // Configurable thresholds
    static THRESHOLD_SUSPICIOUS = 35;
    static THRESHOLD_DANGEROUS = 70;
    static calculateRisk(baseScore, signals, confidence) {
        let finalScore = baseScore;
        for (const signal of signals) {
            finalScore += signal.scoreImpact;
        }
        // Cap between 0 and 100
        finalScore = Math.max(0, Math.min(100, finalScore));
        let level = 'SAFE';
        let verdict = 'No significant threats detected.';
        let recommendation = 'Proceed normally.';
        if (finalScore >= this.THRESHOLD_DANGEROUS) {
            level = 'DANGEROUS';
            verdict = 'High likelihood of malicious intent.';
            recommendation = 'Do not proceed or interact with this content.';
        }
        else if (finalScore >= this.THRESHOLD_SUSPICIOUS) {
            level = 'SUSPICIOUS';
            verdict = 'Suspicious elements found.';
            recommendation = 'Proceed with caution and verify the source.';
        }
        return {
            score: finalScore,
            level,
            verdict,
            confidence,
            indicators: signals,
            recommendation
        };
    }
}
exports.RiskEngine = RiskEngine;

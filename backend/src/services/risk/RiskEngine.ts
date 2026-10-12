export interface DetectionSignal {
  category: string;
  confidence: number;
  description: string;
  scoreImpact: number; // e.g., +20 for suspicious, -10 for safe signal
}

export interface RiskResult {
  score: number;
  level: 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS' | 'UNKNOWN';
  verdict: string;
  confidence: number;
  indicators: DetectionSignal[];
  recommendation: string;
}

/**
 * RiskEngine
 * Centralized logic for scoring and verdicts based on gathered signals.
 */
export class RiskEngine {
  // Configurable thresholds
  private static readonly THRESHOLD_SUSPICIOUS = 35;
  private static readonly THRESHOLD_DANGEROUS = 70;

  static calculateRisk(baseScore: number, signals: DetectionSignal[], confidence: number): RiskResult {
    let finalScore = baseScore;
    
    for (const signal of signals) {
      finalScore += signal.scoreImpact;
    }

    // Cap between 0 and 100
    finalScore = Math.max(0, Math.min(100, finalScore));

    let level: RiskResult['level'] = 'SAFE';
    let verdict = 'No significant threats detected.';
    let recommendation = 'Proceed normally.';

    if (finalScore >= this.THRESHOLD_DANGEROUS) {
      level = 'DANGEROUS';
      verdict = 'High likelihood of malicious intent.';
      recommendation = 'Do not proceed or interact with this content.';
    } else if (finalScore >= this.THRESHOLD_SUSPICIOUS) {
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

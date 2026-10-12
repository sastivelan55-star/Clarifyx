import { RiskEngine, RiskResult, DetectionSignal } from '../risk/RiskEngine';

export interface MessageDetectionProvider {
  analyze(text: string): Promise<{ signals: DetectionSignal[]; baseScore: number; confidence: number; mode: string }>;
}

export class HeuristicMessageProvider implements MessageDetectionProvider {
  public readonly mode = 'HEURISTIC';

  async analyze(text: string) {
    const signals: DetectionSignal[] = [];
    let baseScore = 5;
    const lower = text.toLowerCase();

    const patterns: Array<[RegExp, number, string, string]> = [
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

export class MessageScanner {
  constructor(private provider: MessageDetectionProvider = new HeuristicMessageProvider()) {}

  async scan(text: string): Promise<RiskResult & { mode: string }> {
    const { signals, baseScore, confidence, mode } = await this.provider.analyze(text);
    const risk = RiskEngine.calculateRisk(baseScore, signals, confidence);
    return { ...risk, mode };
  }
}

export const messageScanner = new MessageScanner();

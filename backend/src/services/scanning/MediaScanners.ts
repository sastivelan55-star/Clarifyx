import { RiskEngine, RiskResult, DetectionSignal } from '../risk/RiskEngine';
import { storageProvider } from '../storage/StorageProvider';

export class FakeNewsScanner {
  public readonly mode = 'NOT_IMPLEMENTED'; // Replaced "HEURISTIC" with honest reality

  async scan(text: string): Promise<RiskResult & { mode: string }> {
    const signals: DetectionSignal[] = [
      {
        category: 'LIMITATION',
        confidence: 1.0,
        description: 'Fake News detection requires an external verification API or fact-checking database which is not configured.',
        scoreImpact: 0
      }
    ];

    const risk = RiskEngine.calculateRisk(0, signals, 0.0);
    // Force verdict
    risk.verdict = 'UNABLE_TO_VERIFY';
    risk.level = 'UNKNOWN';
    risk.recommendation = 'Please consult a trusted fact-checking source manually.';

    return { ...risk, mode: this.mode };
  }
}

export class ImageScanner {
  public readonly mode = 'DEMO_MODE'; // Honest reality

  async scan(fileKey: string): Promise<RiskResult & { mode: string }> {
    const exists = await storageProvider.exists(fileKey);
    if (!exists) throw new Error('File not found in storage');

    const signals: DetectionSignal[] = [
      {
        category: 'LIMITATION',
        confidence: 1.0,
        description: 'No real AI vision model is configured. Returning DEMO mode static results.',
        scoreImpact: 0
      }
    ];

    const risk = RiskEngine.calculateRisk(0, signals, 0.0);
    risk.verdict = 'DEMO_RESULT_ONLY';
    risk.level = 'UNKNOWN';
    
    return { ...risk, mode: this.mode };
  }
}

export class VideoScanner {
  public readonly mode = 'DEMO_MODE';

  async scan(fileKey: string): Promise<RiskResult & { mode: string }> {
    const signals: DetectionSignal[] = [
      {
        category: 'LIMITATION',
        confidence: 1.0,
        description: 'Deepfake video detection requires a dedicated ML pipeline which is not configured.',
        scoreImpact: 0
      }
    ];

    const risk = RiskEngine.calculateRisk(0, signals, 0.0);
    risk.verdict = 'DEMO_RESULT_ONLY';
    risk.level = 'UNKNOWN';
    return { ...risk, mode: this.mode };
  }
}

export class VoiceScanner {
  public readonly mode = 'DEMO_MODE';

  async scan(fileKey: string): Promise<RiskResult & { mode: string }> {
    const signals: DetectionSignal[] = [
      {
        category: 'LIMITATION',
        confidence: 1.0,
        description: 'AI Voice Cloning detection requires a dedicated ML model which is not configured.',
        scoreImpact: 0
      }
    ];

    const risk = RiskEngine.calculateRisk(0, signals, 0.0);
    risk.verdict = 'DEMO_RESULT_ONLY';
    risk.level = 'UNKNOWN';
    return { ...risk, mode: this.mode };
  }
}

export const fakeNewsScanner = new FakeNewsScanner();
export const imageScanner = new ImageScanner();
export const videoScanner = new VideoScanner();
export const voiceScanner = new VoiceScanner();

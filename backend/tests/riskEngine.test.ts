import { RiskEngine, DetectionSignal } from '../src/services/risk/RiskEngine';

describe('RiskEngine', () => {
  it('calculates SAFE level correctly', () => {
    const signals: DetectionSignal[] = [
      { category: 'SAFE', confidence: 1.0, description: 'Safe', scoreImpact: 0 }
    ];
    const result = RiskEngine.calculateRisk(5, signals, 1.0);
    expect(result.level).toBe('SAFE');
    expect(result.score).toBe(5);
  });

  it('calculates SUSPICIOUS level correctly', () => {
    const signals: DetectionSignal[] = [
      { category: 'PHISHING', confidence: 0.8, description: 'Test', scoreImpact: 40 }
    ];
    const result = RiskEngine.calculateRisk(5, signals, 0.8);
    expect(result.level).toBe('SUSPICIOUS');
    expect(result.score).toBe(45);
  });

  it('calculates DANGEROUS level correctly', () => {
    const signals: DetectionSignal[] = [
      { category: 'MALWARE', confidence: 1.0, description: 'Test', scoreImpact: 80 }
    ];
    const result = RiskEngine.calculateRisk(10, signals, 1.0);
    expect(result.level).toBe('DANGEROUS');
    expect(result.score).toBe(90);
  });

  it('caps the score at 100 and limits to minimum 0', () => {
    const highSignals: DetectionSignal[] = [{ category: 'BAD', confidence: 1.0, description: 'Test', scoreImpact: 200 }];
    const lowSignals: DetectionSignal[] = [{ category: 'GOOD', confidence: 1.0, description: 'Test', scoreImpact: -50 }];
    
    expect(RiskEngine.calculateRisk(0, highSignals, 1.0).score).toBe(100);
    expect(RiskEngine.calculateRisk(10, lowSignals, 1.0).score).toBe(0);
  });
});

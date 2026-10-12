import { RiskEngine, RiskResult, DetectionSignal } from '../risk/RiskEngine';

export class UrlScanner {
  public readonly mode = 'HEURISTIC';

  async scan(url: string): Promise<RiskResult & { mode: string }> {
    const signals: DetectionSignal[] = [];
    let baseScore = 5; // Start with baseline

    try {
      const parsedUrl = new URL(url);
      const lowerHost = parsedUrl.hostname.toLowerCase();
      const lowerHref = url.toLowerCase();

      // Protocol check
      if (parsedUrl.protocol !== 'https:') {
        signals.push({ category: 'SECURITY', confidence: 1.0, description: 'Connection is not encrypted (HTTP).', scoreImpact: 20 });
      }

      // IP Address check
      if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(lowerHost)) {
        signals.push({ category: 'OBSFUCATION', confidence: 0.9, description: 'IP address used instead of a domain name.', scoreImpact: 25 });
      }

      // Credential/Account phrasing in URL
      if (/login|verify|account|signin|secure|auth|billing/.test(lowerHref)) {
        signals.push({ category: 'PHISHING', confidence: 0.8, description: 'Credential or account verification keywords found in URL.', scoreImpact: 20 });
      }

      // Shorteners
      if (/bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly|is\.gd/.test(lowerHost)) {
        signals.push({ category: 'OBSFUCATION', confidence: 1.0, description: 'URL shortener hides the final destination.', scoreImpact: 15 });
      }

      // Excessive hyphens
      if ((lowerHost.match(/-/g) || []).length > 3) {
        signals.push({ category: 'PHISHING', confidence: 0.7, description: 'Excessive hyphens in domain name.', scoreImpact: 15 });
      }

      // Explicit authentication in URL (@)
      if (parsedUrl.username || parsedUrl.password || url.includes('@')) {
        signals.push({ category: 'OBSFUCATION', confidence: 1.0, description: 'Authentication credentials embedded in URL (@ symbol).', scoreImpact: 30 });
      }

      if (signals.length === 0) {
        signals.push({ category: 'SAFE', confidence: 0.8, description: 'No obvious heuristic phishing indicators found.', scoreImpact: 0 });
      }

      const risk = RiskEngine.calculateRisk(baseScore, signals, 0.85); // 85% confidence in heuristics

      return { ...risk, mode: this.mode };
    } catch (e) {
      // Malformed URL
      signals.push({ category: 'MALFORMED', confidence: 1.0, description: 'Invalid or malformed URL format.', scoreImpact: 50 });
      const risk = RiskEngine.calculateRisk(baseScore, signals, 1.0);
      return { ...risk, mode: this.mode };
    }
  }
}

export const urlScanner = new UrlScanner();

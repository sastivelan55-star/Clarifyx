import { urlScanner } from '../src/services/scanning/UrlScanner';
import { messageScanner } from '../src/services/scanning/MessageScanner';

describe('Scanners', () => {
  describe('UrlScanner', () => {
    it('detects safe URL', async () => {
      const result = await urlScanner.scan('https://google.com');
      expect(result.level).toBe('SAFE');
      expect(result.mode).toBe('HEURISTIC');
    });

    it('detects suspicious shortener URL', async () => {
      const result = await urlScanner.scan('http://bit.ly/12345');
      expect(result.level).toBe('SUSPICIOUS');
    });

    it('detects dangerous credential theft URL', async () => {
      const result = await urlScanner.scan('http://bit.ly/123@login.com');
      expect(result.level).toBe('DANGEROUS');
    });
  });

  describe('MessageScanner', () => {
    it('detects safe message', async () => {
      const result = await messageScanner.scan('Hello, just wanted to check in on the project.');
      expect(result.level).toBe('SAFE');
    });

    it('detects dangerous phishing message', async () => {
      const result = await messageScanner.scan('Urgent! Please verify your account immediately by providing your OTP password to avoid suspension.');
      expect(result.level).toBe('DANGEROUS');
      expect(result.indicators.some(i => i.category === 'CREDENTIAL_THEFT')).toBe(true);
    });
  });
});

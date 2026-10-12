import { urlScanner } from './UrlScanner';
import { messageScanner } from './MessageScanner';
import { fakeNewsScanner, imageScanner, videoScanner, voiceScanner } from './MediaScanners';
import { Scan, Result } from '../../models';
import { RiskResult } from '../risk/RiskEngine';
import { jobQueue } from '../jobs/JobQueue';

export class ScanOrchestrator {
  
  /**
   * Orchestrates synchronous scans (URL, Message, Fake News)
   */
  async executeSyncScan(scanId: string, type: string, target: string): Promise<void> {
    const scan = await Scan.findByPk(scanId);
    if (!scan) return;

    try {
      scan.status = 'PROCESSING';
      await scan.save();

      let scanResult: RiskResult & { mode: string };

      switch (type) {
        case 'URL':
          scanResult = await urlScanner.scan(target);
          break;
        case 'MESSAGE':
          scanResult = await messageScanner.scan(target);
          break;
        case 'FAKE_NEWS':
          scanResult = await fakeNewsScanner.scan(target);
          break;
        default:
          throw new Error('UNSUPPORTED_SYNC_SCAN_TYPE');
      }

      await this.saveResult(scan, scanResult, { target });
    } catch (error: any) {
      scan.status = 'FAILED';
      await scan.save();
      throw error;
    }
  }

  /**
   * Queues an asynchronous media scan (Image, Video, Voice)
   */
  async queueMediaScan(scanId: string, type: string, fileKey: string): Promise<void> {
    const scan = await Scan.findByPk(scanId);
    if (!scan) return;

    scan.status = 'PENDING'; // QUEUED
    await scan.save();

    await jobQueue.addJob('MEDIA_SCAN', { scanId, type, fileKey });
  }

  /**
   * Internal worker handler for async media scans
   */
  async executeMediaScan(scanId: string, type: string, fileKey: string): Promise<void> {
    const scan = await Scan.findByPk(scanId);
    if (!scan) return;

    try {
      scan.status = 'PROCESSING';
      await scan.save();

      let scanResult: RiskResult & { mode: string };

      switch (type) {
        case 'IMAGE':
          scanResult = await imageScanner.scan(fileKey);
          break;
        case 'VIDEO':
          scanResult = await videoScanner.scan(fileKey);
          break;
        case 'VOICE':
          scanResult = await voiceScanner.scan(fileKey);
          break;
        default:
          throw new Error('UNSUPPORTED_MEDIA_SCAN_TYPE');
      }

      await this.saveResult(scan, scanResult, { fileKey });
    } catch (error: any) {
      scan.status = 'FAILED';
      await scan.save();
      throw error;
    }
  }

  private async saveResult(scan: Scan, riskResult: RiskResult & { mode: string }, metadata: object) {
    scan.status = 'COMPLETED';
    scan.riskScore = riskResult.score;
    scan.verdict = riskResult.level;
    scan.completedAt = new Date();
    await scan.save();

    await Result.create({
      scanId: scan.id,
      data: {
        score: riskResult.score,
        level: riskResult.level,
        verdict: riskResult.verdict,
        confidence: riskResult.confidence,
        indicators: riskResult.indicators,
        recommendation: riskResult.recommendation,
        mode: riskResult.mode
      },
      metadata
    });
  }
}

export const scanOrchestrator = new ScanOrchestrator();

// Register the worker handler
jobQueue.registerHandler('MEDIA_SCAN', async (payload) => {
  await scanOrchestrator.executeMediaScan(payload.scanId, payload.type, payload.fileKey!);
});

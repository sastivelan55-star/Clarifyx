/**
 * JobQueue Abstraction
 * Currently uses an in-memory execution for development/prototype.
 * Designed to be swapped with Redis + BullMQ for production.
 */
import { logger } from '../../config/logger';

export interface ScanJobPayload {
  scanId: string;
  type: string;
  target?: string;
  fileKey?: string;
}

export type JobHandler = (payload: ScanJobPayload) => Promise<void>;

export class JobQueue {
  private handlers: Map<string, JobHandler> = new Map();

  registerHandler(queueName: string, handler: JobHandler) {
    this.handlers.set(queueName, handler);
  }

  async addJob(queueName: string, payload: ScanJobPayload): Promise<void> {
    const handler = this.handlers.get(queueName);
    if (!handler) {
      throw new Error(`No handler registered for queue: ${queueName}`);
    }

    // In-memory async execution (DO NOT await here to act as a background queue)
    setImmediate(async () => {
      try {
        await handler(payload);
      } catch (error) {
        logger.error(`Job failed in queue ${queueName}:`, error);
        // Ideally update the scan status to FAILED in the DB here
      }
    });
  }
}

export const jobQueue = new JobQueue();

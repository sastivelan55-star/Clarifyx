import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../config/logger';

/**
 * StorageProvider Interface
 * Designed to be easily swapped with S3 or other object storage in production.
 */
export interface IStorageProvider {
  upload(fileBuffer: Buffer, extension: string): Promise<string>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

export class LocalStorageProvider implements IStorageProvider {
  private baseDir: string;

  constructor() {
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    this.baseDir = isServerless
      ? path.join(os.tmpdir(), 'temp_uploads')
      : path.join(process.cwd(), 'temp_uploads');
    if (!fs.existsSync(this.baseDir)) {
      try {
        fs.mkdirSync(this.baseDir, { recursive: true });
      } catch (err: any) {
        logger.warn(`Storage directory initialization notice: ${err.message}`);
      }
    }
  }

  async upload(fileBuffer: Buffer, extension: string): Promise<string> {
    const key = `${uuidv4()}${extension}`;
    const filePath = path.join(this.baseDir, key);
    await fs.promises.writeFile(filePath, fileBuffer);
    return key;
  }

  async download(key: string): Promise<Buffer> {
    const filePath = path.join(this.baseDir, key);
    return fs.promises.readFile(filePath);
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.baseDir, key);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  async exists(key: string): Promise<boolean> {
    const filePath = path.join(this.baseDir, key);
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

export const storageProvider = new LocalStorageProvider();

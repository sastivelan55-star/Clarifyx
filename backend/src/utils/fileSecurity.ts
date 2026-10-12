import path from 'path';

export class FileValidationService {
  private static readonly ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
  private static readonly ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime'];
  private static readonly ALLOWED_AUDIO_MIMES = ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'];

  private static readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
  private static readonly MAX_AUDIO_SIZE = 20 * 1024 * 1024; // 20MB

  static validateImage(mimeType: string, size: number): void {
    if (!this.ALLOWED_IMAGE_MIMES.includes(mimeType)) {
      throw new Error(`UNSUPPORTED_FILE: Allowed image types: ${this.ALLOWED_IMAGE_MIMES.join(', ')}`);
    }
    if (size > this.MAX_IMAGE_SIZE) {
      throw new Error(`FILE_TOO_LARGE: Max image size is ${this.MAX_IMAGE_SIZE / (1024 * 1024)}MB`);
    }
  }

  static validateVideo(mimeType: string, size: number): void {
    if (!this.ALLOWED_VIDEO_MIMES.includes(mimeType)) {
      throw new Error(`UNSUPPORTED_FILE: Allowed video types: ${this.ALLOWED_VIDEO_MIMES.join(', ')}`);
    }
    if (size > this.MAX_VIDEO_SIZE) {
      throw new Error(`FILE_TOO_LARGE: Max video size is ${this.MAX_VIDEO_SIZE / (1024 * 1024)}MB`);
    }
  }

  static validateAudio(mimeType: string, size: number): void {
    if (!this.ALLOWED_AUDIO_MIMES.includes(mimeType)) {
      throw new Error(`UNSUPPORTED_FILE: Allowed audio types: ${this.ALLOWED_AUDIO_MIMES.join(', ')}`);
    }
    if (size > this.MAX_AUDIO_SIZE) {
      throw new Error(`FILE_TOO_LARGE: Max audio size is ${this.MAX_AUDIO_SIZE / (1024 * 1024)}MB`);
    }
  }

  static getSafeExtension(originalName: string): string {
    const ext = path.extname(originalName).toLowerCase();
    // Basic sanitization
    if (!/^\.[a-z0-9]+$/.test(ext)) {
      return '.bin';
    }
    return ext;
  }
}

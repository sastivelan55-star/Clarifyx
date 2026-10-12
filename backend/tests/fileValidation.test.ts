import { FileValidationService } from '../src/utils/fileSecurity';

describe('FileValidationService', () => {
  it('validates safe image sizes and types', () => {
    expect(() => FileValidationService.validateImage('image/png', 5 * 1024 * 1024)).not.toThrow();
  });

  it('throws on oversized image', () => {
    expect(() => FileValidationService.validateImage('image/png', 15 * 1024 * 1024)).toThrow('FILE_TOO_LARGE');
  });

  it('throws on invalid image mime type', () => {
    expect(() => FileValidationService.validateImage('application/pdf', 1 * 1024 * 1024)).toThrow('UNSUPPORTED_FILE');
  });

  it('sanitizes malicious file extensions', () => {
    expect(FileValidationService.getSafeExtension('test.png')).toBe('.png');
    expect(FileValidationService.getSafeExtension('test.exe')).toBe('.exe'); // Still .exe, but mime blocks it
    expect(FileValidationService.getSafeExtension('test.php*^')).toBe('.bin'); // Malformed
  });
});

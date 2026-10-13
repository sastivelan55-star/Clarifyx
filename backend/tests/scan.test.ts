import request from 'supertest';
import app from '../src/app';
import { sequelize } from '../src/config/database';

describe('Scan API', () => {
  let scanId: string;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a new scan', async () => {
    const res = await request(app)
      .post('/api/scans')
      .send({ scanType: 'URL', input: 'http://example.com' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.scanType).toBe('URL');
    expect(res.body.data.status).toBe('COMPLETED');
    expect(res.body.data.result).toBeDefined();

    scanId = res.body.data.id;
  });

  it('should get all scans', async () => {
    const res = await request(app).get('/api/scans');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should get a single scan by ID', async () => {
    const res = await request(app).get(`/api/scans/${scanId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(scanId);
  });

  it('should return 404 for a non-existent scan', async () => {
    const res = await request(app).get(`/api/scans/00000000-0000-0000-0000-000000000000`);
    expect(res.status).toBe(404);
  });

  it('should upload and scan a valid JPEG image', async () => {
    const fakeJpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
    const res = await request(app)
      .post('/api/v1/scans/media')
      .field('scanType', 'IMAGE')
      .attach('file', fakeJpegBuffer, { filename: 'download.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.scanType).toBe('IMAGE');
    expect(res.body.data.status).toBe('COMPLETED');
    expect(res.body.data.result).toBeDefined();
    expect(res.body.data.result.data.mode).toBe('DEMO_MODE');
  });

  it('should reject an unsupported file format for image scan', async () => {
    const fakePdfBuffer = Buffer.from('%PDF-1.4 ...');
    const res = await request(app)
      .post('/api/v1/scans/media')
      .field('scanType', 'IMAGE')
      .attach('file', fakePdfBuffer, { filename: 'malicious.pdf', contentType: 'application/pdf' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNSUPPORTED_FILE');
  });

  it('should reject a malformed request without file', async () => {
    const res = await request(app)
      .post('/api/v1/scans/media')
      .field('scanType', 'IMAGE');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should delete a scan', async () => {
    const res = await request(app).delete(`/api/scans/${scanId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

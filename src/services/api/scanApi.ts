import { apiClient } from './apiClient';
import { Scan, ScanType, ApiResponse } from '../../types';

export const scanApi = {
  async createScan(type: ScanType, target: string): Promise<ApiResponse<Scan>> {
    return apiClient.post('/scans', { scanType: type, input: target });
  },

  async uploadScanMedia(type: ScanType, file: File): Promise<ApiResponse<Scan>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('scanType', type);
    return apiClient.postForm('/scans/media', formData);
  },

  async getScan(id: string): Promise<ApiResponse<Scan>> {
    return apiClient.get(`/scans/${id}`);
  },

  async getHistory(): Promise<ApiResponse<Scan[]>> {
    return apiClient.get('/scans');
  },
  
  async deleteScan(id: string): Promise<void> {
    return apiClient.delete(`/scans/${id}`);
  }
};

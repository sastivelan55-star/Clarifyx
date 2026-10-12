import { apiClient } from './apiClient';
import { User, ApiResponse } from '../../types';

export const authApi = {
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get('/auth/me');
  },

  async logout(): Promise<void> {
    return apiClient.post('/auth/logout', {});
  },

  // Mock implementation for login/register as we don't store passwords on frontend
  // These would typically send credentials in exchange for HttpOnly cookies
  async login(credentials: unknown): Promise<ApiResponse<User>> {
    return apiClient.post('/auth/login', credentials);
  },

  async register(data: unknown): Promise<ApiResponse<User>> {
    return apiClient.post('/auth/register', data);
  }
};

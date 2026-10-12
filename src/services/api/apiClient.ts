import { ApiError } from '../../types';

const BASE_URL = '/api/v1'; // Assuming a typical proxy or relative path

async function fetchWithInterceptor(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  // Note: in a real app, we'd add auth headers here if not using HttpOnly cookies
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, { credentials: 'include', ...options, headers });
    
    // We can handle 401 globally here if needed (e.g. redirect to login)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: ApiError = {
        message: errorData.message || response.statusText || 'An error occurred',
        code: errorData.code || String(response.status),
        details: errorData.details,
      };
      throw error;
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    if ((error as ApiError).message) {
      throw error;
    }
    // Handle network errors
    const networkError: ApiError = {
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR'
    };
    throw networkError;
  }
}

export const apiClient = {
  get: (endpoint: string, options?: RequestInit) => fetchWithInterceptor(endpoint, { ...options, method: 'GET' }),
  post: (endpoint: string, data: unknown, options?: RequestInit) => 
    fetchWithInterceptor(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint: string, data: unknown, options?: RequestInit) => 
    fetchWithInterceptor(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint: string, options?: RequestInit) => fetchWithInterceptor(endpoint, { ...options, method: 'DELETE' }),
  
  // Form data doesn't use Content-Type: application/json
  postForm: async (endpoint: string, formData: FormData, options?: RequestInit) => {
    const url = `${BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, { credentials: 'include', ...options, method: 'POST', body: formData });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message: errorData.message || response.statusText,
          code: errorData.code || String(response.status),
        } as ApiError;
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }
};

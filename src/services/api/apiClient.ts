import { ApiError } from '../../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function fetchWithInterceptor(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, { credentials: 'include', ...options, headers });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const fallbackStatus = response.status === 405
        ? 'Endpoint method not allowed. Backend routing may be misconfigured.'
        : response.status === 413
          ? 'Uploaded payload exceeds maximum server limit.'
          : response.statusText;
      const error: ApiError = {
        message: errorData.error?.message || errorData.message || fallbackStatus || 'An error occurred',
        code: errorData.error?.code || errorData.code || String(response.status),
        details: errorData.details || errorData.error?.details,
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
    const networkError: ApiError = {
      message: 'Backend service unreachable. Please check your network connection.',
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
        const fallbackStatus = response.status === 405
          ? 'Endpoint method not allowed. Backend routing may be misconfigured.'
          : response.status === 413
            ? 'Uploaded file exceeds the maximum allowed payload size.'
            : response.statusText;
        throw {
          message: errorData.error?.message || errorData.message || fallbackStatus || 'An error occurred',
          code: errorData.error?.code || errorData.code || String(response.status),
          details: errorData.details || errorData.error?.details,
        } as ApiError;
      }
      return await response.json();
    } catch (error) {
      if ((error as ApiError).message) {
        throw error;
      }
      const networkError: ApiError = {
        message: 'Backend service unreachable. Please check your network connection.',
        code: 'NETWORK_ERROR'
      };
      throw networkError;
    }
  }
};

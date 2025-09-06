import { apiConfig, getAuthHeaders } from './config';

// Types for API responses and errors
export interface APIResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export interface APIError {
  message: string;
  status: number;
  code?: string;
}

// Custom error class for API errors
export class APIError extends Error {
  public status: number;
  public code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code || '';
  }
}

// Request options interface
export interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  authToken?: string;
}

// Generic request function with retry logic and timeout
async function makeRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { timeout = apiConfig.timeout, retries = apiConfig.retries, authToken, ...fetchOptions } = options;
  
  const url = `${apiConfig.baseUrl}${endpoint}`;
  
  // Get auth headers if token is provided
  const authHeaders = authToken ? getAuthHeaders(authToken) : {};
  
  const defaultHeaders = {
    ...apiConfig.headers,
    ...authHeaders,
    ...fetchOptions.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const requestOptions: RequestInit = {
    ...fetchOptions,
    headers: defaultHeaders,
    signal: controller.signal,
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData.code
        );
      }

      const data = await response.json();
      
      // Handle different response structures from the backend
      // The backend might return data directly or wrapped in a response object
      if (data && typeof data === 'object') {
        // If the response has a 'data' property, extract it
        if ('data' in data) {
          return data.data;
        }
        // If the response has a 'markets' property (for markets endpoint), extract it
        if ('markets' in data) {
          return data.markets;
        }
        // If the response has a 'trades' property, extract it
        if ('trades' in data) {
          return data.trades;
        }
        // If the response has a 'orders' property, extract it
        if ('orders' in data) {
          return data.orders;
        }
        // If the response has a 'balances' property, extract it
        if ('balances' in data) {
          return data.balances;
        }
        // Otherwise return the data as is
        return data;
      }
      
      return data;
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx) or if it's the last attempt
      if (error instanceof APIError && error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      if (attempt === retries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  throw lastError;
}

// HTTP method functions
export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions): Promise<T> =>
    makeRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> =>
    makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
    }),

  put: <T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> =>
    makeRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
    }),

  patch: <T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> =>
    makeRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null,
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions): Promise<T> =>
    makeRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

// Export config and helper functions
export { apiConfig, getApiBaseUrl, getAuthHeaders } from './config';
export type { APIConfig } from './config';
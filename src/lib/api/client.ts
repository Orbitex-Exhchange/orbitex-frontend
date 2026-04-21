import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError
} from 'axios';
import { env } from '../env';

// ===== API CLIENT CONFIGURATION =====

export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  enableLogging: boolean;
}

export interface ApiRequestConfig extends AxiosRequestConfig {
  retry?: boolean;
  retries?: number;
  retryDelay?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: AxiosRequestConfig;
}

// ===== RETRY LOGIC =====

class RetryManager {
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx)
        if (error instanceof AxiosError && error.response?.status && error.response.status >= 400 && error.response.status < 500) {
          throw error;
        }

        if (attempt === maxRetries) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * delay));
      }
    }

    throw lastError!;
  }
}

// ===== API CLIENT =====

export class ApiClient {
  private client: AxiosInstance;
  private retryManager: RetryManager;
  private config: ApiClientConfig;

  constructor(config?: Partial<ApiClientConfig>) {
    this.config = {
      baseURL: env?.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      enableLogging: true,
      ...config,
    };
    if (typeof window !== 'undefined') {
      console.log('DEBUG: ApiClient initializing, env.NEXT_PUBLIC_API_URL:', env?.NEXT_PUBLIC_API_URL);
    }
    // Safe access to config
    if (this.config.enableLogging && typeof console !== 'undefined') {
      console.log('API Client baseURL:', this.config.baseURL);
    }

    this.retryManager = new RetryManager();
    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  // ===== REQUEST METHODS =====

  async get<T = any>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T = any>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // ===== CORE REQUEST METHOD =====

  private async request<T>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const shouldRetry = config.retry !== false;
    const maxRetries = config.retries || this.config.retries;
    const delay = config.retryDelay || this.config.retryDelay;

    const executeRequest = async (): Promise<ApiResponse<T>> => {
      try {
        const response = await this.requestWithFallbacks<T>(config);
        return {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          config: response.config,
        };
      } catch (error) {
        if (error instanceof AxiosError) {
          // Handle different error response formats
          let errorMessage = error.message;
          let errorCode = 'UNKNOWN_ERROR';

          if (error.response?.data) {
            const data = error.response.data;

            // Handle Peatio V2 error format: { "errors": ["error.code"] }
            if (data.errors && Array.isArray(data.errors)) {
              errorMessage = data.errors.join(', ');
              errorCode = data.errors[0] || errorCode;
            }
            // Handle standard error format: { "message": "...", "code": "..." }
            else if (data.message) {
              errorMessage = data.message;
              errorCode = data.code || errorCode;
            }
          }

          throw new ApiError(
            errorMessage,
            error.response?.status || 0,
            errorCode
          );
        }
        throw error;
      }
    };

    if (shouldRetry) {
      return this.retryManager.executeWithRetry(executeRequest, maxRetries, delay);
    }

    return executeRequest();
  }

  private async requestWithFallbacks<T>(config: ApiRequestConfig) {
    const candidateRequests = this.buildRequestCandidates(config);
    let lastError: unknown = null;

    for (const candidate of candidateRequests) {
      try {
        return await this.client.request<T>(candidate);
      } catch (error) {
        lastError = error;

        if (!(error instanceof AxiosError) || !this.shouldTryFallback(config, error)) {
          throw error;
        }
      }
    }

    throw lastError;
  }

  private buildRequestCandidates(config: ApiRequestConfig): AxiosRequestConfig[] {
    const urls = this.getCandidateUrls(config.url);
    const baseURLs = this.getCandidateBaseURLs();
    const candidates: AxiosRequestConfig[] = [];
    const seen = new Set<string>();

    for (const baseURL of baseURLs) {
      for (const url of urls) {
        const key = `${baseURL}::${url}`;
        if (seen.has(key)) continue;

        seen.add(key);
        candidates.push({
          ...config,
          baseURL,
          url,
        });
      }
    }

    return candidates;
  }

  private getCandidateBaseURLs(): string[] {
    const primary = this.config.baseURL.replace(/\/$/, '');
    const fallback = env?.NEXT_PUBLIC_API_FALLBACK_URL?.replace(/\/$/, '');
    const derivedBackend = primary.includes('orbitex-') && !primary.includes('orbitex-backend-')
      ? primary.replace('://orbitex-', '://orbitex-backend-')
      : undefined;

    return Array.from(new Set([primary, fallback, derivedBackend].filter(Boolean) as string[]));
  }

  private getCandidateUrls(url?: string): string[] {
    if (!url) return [''];

    const normalized = url.endsWith('/') ? url.slice(0, -1) : url;
    const candidates = new Set<string>([normalized]);

    if (normalized.includes('/api/api_v2/')) {
      candidates.add(normalized.replace('/api/api_v2/', '/api/v2/'));
    }

    if (normalized.includes('/api/v2/')) {
      candidates.add(normalized.replace('/api/v2/', '/api/api_v2/'));
    }

    if (normalized.includes('/api/api_v2/public/')) {
      candidates.add(normalized.replace('/api/api_v2/public/', '/api/v2/public/'));
    }

    if (normalized.includes('/api/v2/public/')) {
      candidates.add(normalized.replace('/api/v2/public/', '/api/api_v2/public/'));
    }

    if (normalized.endsWith('/ticker')) {
      candidates.add(normalized.replace(/\/ticker$/, '/tickers'));
      candidates.add(normalized.replace(/\/ticker$/, '/tickers/'));
    }

    if (normalized.endsWith('/tickers')) {
      candidates.add(`${normalized}/`);
    }

    return Array.from(candidates);
  }

  private shouldTryFallback(config: ApiRequestConfig, error: AxiosError): boolean {
    const method = (config.method || 'GET').toUpperCase();
    const url = config.url || '';
    const status = error.response?.status;

    if (method !== 'GET') return false;
    if (!url.includes('/api/')) return false;

    return status === undefined || status === 404 || status === 500 || status === 502 || status === 503 || status === 504;
  }

  // ===== UTILITY METHODS =====

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Always get fresh token from localStorage on each request
        const token = this.getAuthToken();
        if (token) {
          // Ensure proper Bearer token format
          config.headers.Authorization = `Bearer ${token}`;
          if (this.config.enableLogging) {
            // Log token presence (not the token itself for security)
            const tokenParts = token.split('.');
            const tokenInfo: any = {
              method: config.method?.toUpperCase(),
              url: config.url,
              hasToken: true,
              tokenLength: token.length,
              tokenParts: tokenParts.length
            };

            // Decode token to verify it's valid
            try {
              if (tokenParts.length === 3 && tokenParts[1]) {
                const payload = JSON.parse(atob(tokenParts[1]));
                tokenInfo.hasUid = !!payload.uid;
                tokenInfo.hasEmail = !!payload.email;
                tokenInfo.hasRole = !!payload.role;
                tokenInfo.hasState = !!payload.state;
                tokenInfo.hasLevel = payload.level !== undefined;
                tokenInfo.exp = payload.exp ? new Date(payload.exp * 1000).toISOString() : null;
                tokenInfo.isExpired = payload.exp ? Date.now() > payload.exp * 1000 : false;
              }
            } catch (e) {
              console.warn('Failed to decode token for logging:', e);
            }

            console.log('API Request:', tokenInfo);
          }
        } else {
          if (this.config.enableLogging) {
            console.warn('API Request without token:', {
              method: config.method?.toUpperCase(),
              url: config.url,
              endpoint: config.url?.includes('/account/') ? 'Account endpoint - requires auth' : ''
            });
          }
        }

        return config;
      },
      (error) => {
        if (this.config.enableLogging) {
          console.error('API Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        if (this.config.enableLogging) {
          console.log('API Response:', { status: response.status, url: response.config.url });
        }
        return response;
      },
      async (error) => {
        if (error.response) {
          // Handle 401/403 errors - might be auth issue
          if (error.response.status === 401 || error.response.status === 403) {
            const errorData = error.response.data;
            const errorMessage = errorData?.errors?.[0] || errorData?.error?.message || error.message;

            console.error('API Auth Error:', {
              status: error.response.status,
              url: error.config?.url,
              error: errorMessage,
              hasToken: !!this.getAuthToken(),
              endpoint: error.config?.url
            });

            // If it's a permission error and we have a token, log detailed token info
            if (errorMessage.includes('not_permitted') || errorMessage.includes('ability')) {
              const token = this.getAuthToken();
              if (token) {
                try {
                  const parts = token.split('.');
                  if (parts.length === 3 && parts[1]) {
                    const payload = JSON.parse(atob(parts[1]));
                    console.error('Token Details:', {
                      exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'N/A',
                      isExpired: payload.exp ? Date.now() > payload.exp * 1000 : false,
                      uid: payload.uid || 'MISSING',
                      role: payload.role || 'MISSING',
                      email: payload.email || 'MISSING',
                      state: payload.state || 'MISSING',
                      level: payload.level !== undefined ? payload.level : 'MISSING',
                      hasAllFields: !!(payload.uid && payload.email && payload.role && payload.state && payload.level !== undefined)
                    });

                    // Clear invalid token if it's expired or missing required fields
                    if (payload.exp && Date.now() > payload.exp * 1000) {
                      console.error('Token is expired, clearing from localStorage');
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('access_token');
                        // Dispatch event to notify auth context
                        window.dispatchEvent(new Event('storage'));
                      }
                    } else if (!payload.uid || !payload.email || !payload.role || !payload.state || payload.level === undefined) {
                      console.error('Token missing required fields, may cause auth issues');
                    }
                  } else {
                    console.error('Invalid token format - expected 3 parts, got:', parts.length);
                  }
                } catch (e) {
                  console.error('Failed to decode token:', e);
                }
              } else {
                console.error('No token found in localStorage');
              }
            }

            // Don't automatically logout on 403 - might be permission issue, not auth issue
            // But do clear token if it's clearly invalid (401 or expired)
            if (error.response.status === 401) {
              console.warn('401 Unauthorized - token may be invalid, consider refreshing');
            }
          }
        }

        if (this.config.enableLogging) {
          console.error('API Response Error:', error);
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      // Validate token format (should be a JWT with 3 parts)
      if (token) {
        const parts = token.split('.');
        if (parts.length !== 3) {
          console.warn('Invalid token format in localStorage, expected JWT with 3 parts');
          return null;
        }
        // Check if token is expired
        try {
          if (parts[1]) {
            const payload = JSON.parse(atob(parts[1]));
            if (payload.exp && Date.now() > payload.exp * 1000) {
              console.warn('Token in localStorage is expired');
              localStorage.removeItem('access_token');
              return null;
            }
          }
        } catch (e) {
          console.warn('Failed to parse token payload:', e);
          return null;
        }
      }
      return token;
    }
    return null;
  }

  // ===== CONFIGURATION =====

  updateConfig(config: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...config };

    // Update axios instance
    this.client.defaults.baseURL = this.config.baseURL;
    this.client.defaults.timeout = this.config.timeout;
  }

  getConfig(): ApiClientConfig {
    return { ...this.config };
  }
}

// ===== ERROR HANDLING =====

export class ApiError extends Error {
  public status: number;
  public code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// ===== SINGLETON INSTANCE =====

export const apiClient = new ApiClient();

// ===== CONVENIENCE EXPORTS =====

export const api = {
  get: <T = any>(url: string, config?: ApiRequestConfig) => apiClient.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: ApiRequestConfig) => apiClient.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: ApiRequestConfig) => apiClient.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: ApiRequestConfig) => apiClient.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: ApiRequestConfig) => apiClient.delete<T>(url, config),
};

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
      baseURL: env.NEXT_PUBLIC_API_URL,
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      enableLogging: true,
      ...config,
    };

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
        const response = await this.client.request<T>(config);
        return {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          config: response.config,
        };
      } catch (error) {
        if (error instanceof AxiosError) {
          throw new ApiError(
            error.response?.data?.message || error.message,
            error.response?.status || 0,
            error.response?.data?.code || 'UNKNOWN_ERROR'
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

  // ===== UTILITY METHODS =====

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token only for non-public endpoints
        const isPublicEndpoint = this.isPublicEndpoint(config.url || '');
        if (!isPublicEndpoint) {
          const token = this.getAuthToken();
          if (token && !token.startsWith('demo_token')) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        if (this.config.enableLogging) {
          console.log('API Request:', { method: config.method, url: config.url, isPublic: isPublicEndpoint });
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
      (error) => {
        if (this.config.enableLogging) {
          console.error('API Response Error:', error);
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private isPublicEndpoint(url: string): boolean {
    const publicEndpoints = [
      '/api/api_v2/public/',
      '/api/v2/public/',
      '/public/',
      '/markets',
      '/tickers',
      '/currencies',
      '/k-line',
      '/trades',
      '/order-book'
    ];
    
    return publicEndpoints.some(endpoint => url.includes(endpoint));
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

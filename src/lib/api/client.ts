import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError,
  CancelTokenSource 
} from 'axios';
import { env } from '../env';
import { CommonError, AppConfig } from '@/types';

// ===== API CLIENT CONFIGURATION =====

export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  cacheTimeout: number;
  enableCache: boolean;
  enableRetry: boolean;
  enableLogging: boolean;
}

export interface ApiRequestConfig extends AxiosRequestConfig {
  cache?: boolean;
  cacheTimeout?: number;
  retry?: boolean;
  retries?: number;
  retryDelay?: number;
  priority?: 'low' | 'normal' | 'high';
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: AxiosRequestConfig;
}

// ===== CACHE IMPLEMENTATION =====

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTTL = defaultTTL;
    this.startCleanup();
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private startCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Cleanup every minute
  }
}

// ===== RETRY LOGIC =====

class RetryManager {
  private retryCount = new Map<string, number>();

  async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    backoff: number = 2
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }

        // Don't retry on client errors (4xx)
        if (axios.isAxiosError(error) && error.response?.status && error.response.status < 500) {
          break;
        }

        // Exponential backoff
        const waitTime = delay * Math.pow(backoff, attempt);
        await this.sleep(waitTime);
      }
    }

    throw lastError!;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ===== REQUEST QUEUE FOR HIGH-FREQUENCY TRADING =====

interface QueuedRequest {
  id: string;
  config: ApiRequestConfig;
  priority: number;
  timestamp: number;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private readonly maxConcurrent: number;
  private activeRequests = 0;

  constructor(maxConcurrent: number = 10) {
    this.maxConcurrent = maxConcurrent;
  }

  async add<T>(
    id: string,
    config: ApiRequestConfig,
    priority: number = 1
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        id,
        config,
        priority,
        timestamp: Date.now(),
        resolve,
        reject,
      });

      this.queue.sort((a, b) => b.priority - a.priority);
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.processing || this.activeRequests >= this.maxConcurrent) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const request = this.queue.shift();
      if (!request) break;

      this.activeRequests++;
      this.executeRequest(request).finally(() => {
        this.activeRequests--;
        this.process();
      });
    }

    this.processing = false;
  }

  private async executeRequest(request: QueuedRequest): Promise<void> {
    try {
      // Simulate request execution
      const result = await this.executeApiRequest(request.config);
      request.resolve(result);
    } catch (error) {
      request.reject(error);
    }
  }

  private async executeApiRequest(config: ApiRequestConfig): Promise<any> {
    // This would be implemented with the actual axios client
    throw new Error('Not implemented');
  }
}

// ===== MAIN API CLIENT =====

export class ApiClient {
  private client: AxiosInstance;
  private cache: ApiCache;
  private retryManager: RetryManager;
  private requestQueue: RequestQueue;
  private cancelTokens = new Map<string, CancelTokenSource>();
  private config: ApiClientConfig;

  constructor(config?: Partial<ApiClientConfig>) {
    this.config = {
      baseURL: env.NEXT_PUBLIC_API_BASE_URL,
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      cacheTimeout: 5 * 60 * 1000,
      enableCache: true,
      enableRetry: true,
      enableLogging: process.env.NODE_ENV === 'development',
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.cache = new ApiCache(this.config.cacheTimeout);
    this.retryManager = new RetryManager();
    this.requestQueue = new RequestQueue();

    this.setupInterceptors();
  }

  // ===== REQUEST METHODS =====

  async get<T = any>(
    url: string, 
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(
    url: string, 
    data?: any, 
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(
    url: string, 
    data?: any, 
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T = any>(
    url: string, 
    data?: any, 
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T = any>(
    url: string, 
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // ===== MAIN REQUEST METHOD =====

  private async request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const requestId = this.generateRequestId(config);
    const cacheKey = this.generateCacheKey(config);

    // Check cache first
    if (this.config.enableCache && config.cache !== false) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached) {
        this.log('Cache hit', { url: config.url, cacheKey });
        return cached;
      }
    }

    // Create cancel token
    const cancelToken = axios.CancelToken.source();
    this.cancelTokens.set(requestId, cancelToken);

    try {
      // Add to request queue for high-frequency trading
      const priority = this.getPriority(config.priority);
      const result = await this.requestQueue.add<ApiResponse<T>>(
        requestId,
        { ...config, cancelToken },
        priority
      );

      // Cache successful responses
      if (this.config.enableCache && config.cache !== false) {
        const ttl = config.cacheTimeout || this.config.cacheTimeout;
        this.cache.set(cacheKey, result, ttl);
      }

      return result;
    } finally {
      this.cancelTokens.delete(requestId);
    }
  }

  // ===== WEBSOCKET SUPPORT =====

  createWebSocket(url: string): WebSocket {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      this.log('WebSocket connected', { url });
    };

    ws.onclose = () => {
      this.log('WebSocket disconnected', { url });
    };

    ws.onerror = (error) => {
      this.log('WebSocket error', { url, error });
    };

    return ws;
  }

  // ===== CANCELLATION =====

  cancelRequest(requestId: string): void {
    const cancelToken = this.cancelTokens.get(requestId);
    if (cancelToken) {
      cancelToken.cancel('Request cancelled');
      this.cancelTokens.delete(requestId);
    }
  }

  cancelAllRequests(): void {
    this.cancelTokens.forEach((cancelToken) => {
      cancelToken.cancel('All requests cancelled');
    });
    this.cancelTokens.clear();
  }

  // ===== CACHE MANAGEMENT =====

  clearCache(): void {
    this.cache.clear();
  }

  invalidateCache(pattern: string): void {
    // Implementation for pattern-based cache invalidation
    this.log('Cache invalidated', { pattern });
  }

  // ===== UTILITY METHODS =====

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId(config);

        this.log('Request', { 
          method: config.method?.toUpperCase(), 
          url: config.url,
          headers: config.headers 
        });

        return config;
      },
      (error) => {
        this.log('Request error', { error: error.message });
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        this.log('Response', { 
          status: response.status, 
          url: response.config.url,
          data: response.data 
        });
        return response;
      },
      (error: AxiosError) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: AxiosError): void {
    if (axios.isCancel(error)) {
      this.log('Request cancelled', { url: error.config?.url });
      return;
    }

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;

      this.log('Response error', { 
        status, 
        url: error.config?.url,
        data 
      });

      // Handle specific error cases
      switch (status) {
        case 401:
          this.handleUnauthorized();
          break;
        case 403:
          this.handleForbidden();
          break;
        case 429:
          this.handleRateLimit();
          break;
        case 500:
          this.handleServerError();
          break;
      }
    } else if (error.request) {
      // Network error
      this.log('Network error', { 
        url: error.config?.url,
        error: error.message 
      });
    } else {
      // Other error
      this.log('Request error', { 
        url: error.config?.url,
        error: error.message 
      });
    }
  }

  private handleUnauthorized(): void {
    // Clear auth token and redirect to login
    this.clearAuthToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  private handleForbidden(): void {
    // Handle forbidden access
    this.log('Access forbidden');
  }

  private handleRateLimit(): void {
    // Implement rate limiting logic
    this.log('Rate limit exceeded');
  }

  private handleServerError(): void {
    // Handle server errors
    this.log('Server error occurred');
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private clearAuthToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
  }

  private generateRequestId(config: AxiosRequestConfig): string {
    return `${config.method}-${config.url}-${Date.now()}-${Math.random()}`;
  }

  private generateCacheKey(config: ApiRequestConfig): string {
    const { method, url, params, data } = config;
    return `${method}-${url}-${JSON.stringify(params)}-${JSON.stringify(data)}`;
  }

  private getPriority(priority?: string): number {
    switch (priority) {
      case 'high': return 3;
      case 'low': return 1;
      default: return 2;
    }
  }

  private log(message: string, data?: any): void {
    if (this.config.enableLogging) {
      console.log(`[ApiClient] ${message}`, data);
    }
  }
}

// ===== SINGLETON INSTANCE =====

export const apiClient = new ApiClient();

// ===== SPECIALIZED CLIENTS =====

export class TradingApiClient extends ApiClient {
  constructor() {
    super({
      timeout: 5000, // Faster timeout for trading
      retries: 1, // Fewer retries for trading
      retryDelay: 100, // Faster retry for trading
      enableCache: false, // No cache for trading data
    });
  }

  // Trading-specific methods
  async getOrderBook(market: string, limit: number = 20): Promise<any> {
    return this.get(`/public/markets/${market}/order-book?limit=${limit}`, {
      priority: 'high',
      cache: false,
    });
  }

  async getTicker(market: string): Promise<any> {
    return this.get(`/public/markets/${market}/ticker`, {
      priority: 'high',
      cache: false,
    });
  }

  async createOrder(orderData: any): Promise<any> {
    return this.post('/market/orders', orderData, {
      priority: 'high',
      cache: false,
    });
  }

  async cancelOrder(orderId: number): Promise<any> {
    return this.post(`/market/orders/${orderId}/cancel`, {}, {
      priority: 'high',
      cache: false,
    });
  }
}

export class UserApiClient extends ApiClient {
  constructor() {
    super({
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      enableCache: true,
    });
  }

  // User-specific methods
  async getUserProfile(): Promise<any> {
    return this.get('/resource/users/me', {
      cache: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
    });
  }

  async updateUserProfile(profileData: any): Promise<any> {
    return this.put('/resource/users', profileData, {
      cache: false,
    });
  }

  async getWallets(): Promise<any> {
    return this.get('/account/balances', {
      cache: true,
      cacheTimeout: 30 * 1000, // 30 seconds
    });
  }
}

// ===== EXPORT SPECIALIZED CLIENTS =====

export const tradingApi = new TradingApiClient();
export const userApi = new UserApiClient();

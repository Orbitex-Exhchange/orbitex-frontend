// Environment-based configuration for Next.js 15
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const getBaseUrl = () => {
  // Use environment variable for API URL
  const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (envApiUrl) {
    return envApiUrl;
  }

  // Default to local development
  if (isDevelopment) {
    return 'http://localhost:3330';
  }
  
  // Production URL
  return 'http://0.0.0.0:3002';
};

const baseUrl = getBaseUrl();

export interface APIConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}

export const apiConfig: APIConfig = {
  baseUrl,
  timeout: 15000, // 15 seconds for production
  retries: 3,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Helper function to get the base URL
export const getApiBaseUrl = () => apiConfig.baseUrl;

// Helper function to get auth headers
export const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};
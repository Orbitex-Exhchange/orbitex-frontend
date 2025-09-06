import { env } from '@/lib/env';

// Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  email_verified: boolean;
  role: 'admin' | 'member' | 'operator' | 'compliance' | 'support';
  kyc_level: 0 | 1 | 2 | 3;
  state: 'active' | 'inactive' | 'banned' | 'pending' | 'suspended';
  two_factor_enabled: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  terms_accepted: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  two_factor_code?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface TwoFactorSetupRequest {
  secret: string;
  code: string;
}

export interface TwoFactorVerifyRequest {
  code: string;
}

// Auth API Client
class AuthAPI {
  private baseURL: string;

  constructor() {
    // Orbisigner v2 identity base
    this.baseURL = env.NEXT_PUBLIC_AUTH_SERVICE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Auth API request failed:', error);
      throw error;
    }
  }

  // Register a new user
  async register(data: RegisterRequest): Promise<AuthResponse> {
    // POST /api/v2/identity/users
    return this.request<AuthResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Login user
  async login(data: LoginRequest): Promise<AuthResponse> {
    // POST /api/v2/identity/sessions
    return this.request<AuthResponse>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Verify email
  async verifyEmail(data: VerifyEmailRequest): Promise<{ message: string; success: boolean }> {
    // Not implemented in Orbisigner; placeholder path if added later
    return this.request<{ message: string; success: boolean }>('/users/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Resend verification email
  async resendVerification(data: ResendVerificationRequest): Promise<{ message: string; success: boolean }> {
    return this.request<{ message: string; success: boolean }>('/users/resend-verification', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Forgot password
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string; success: boolean }> {
    return this.request<{ message: string; success: boolean }>('/passwords/forgot', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reset password
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string; success: boolean }> {
    return this.request<{ message: string; success: boolean }>('/passwords/reset', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Change password (requires authentication)
  async changePassword(data: ChangePasswordRequest, token: string): Promise<{ message: string; success: boolean }> {
    return this.request<{ message: string; success: boolean }>('/passwords/change', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  // Setup two-factor authentication
  async setupTwoFactor(data: TwoFactorSetupRequest, token: string): Promise<{ message: string; success: boolean }> {
    return this.request<{ message: string; success: boolean }>('/otp/enable', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  // Verify two-factor authentication
  async verifyTwoFactor(data: TwoFactorVerifyRequest, token: string): Promise<{ message: string; success: boolean }> {
    return this.request<{ message: string; success: boolean }>('/otp/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  // Get user profile (requires authentication)
  async getProfile(token: string): Promise<User> {
    return this.request<User>('/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Update user profile (requires authentication)
  async updateProfile(data: Partial<User>, token: string): Promise<User> {
    return this.request<User>('/users/me', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    // Not implemented; keep interface
    return this.request<AuthTokens>('/sessions/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  // Logout (requires authentication)
  async logout(token: string): Promise<{ message: string; success: boolean }> {
    return this.request<{ message: string; success: boolean }>('/sessions/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health', {
      method: 'GET',
    });
  }
}

// Export singleton instance
export const authAPI = new AuthAPI();

// All types are already exported as interfaces above

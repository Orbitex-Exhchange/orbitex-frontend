import { jwtDecode } from 'jwt-decode';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  kyc_level: number;
  email_verified: boolean;
  phone_verified: boolean;
  two_factor_enabled: boolean;
}

export interface DecodedToken {
  sub: string;
  email: string;
  role: string;
  kyc_level: number;
  email_verified: boolean;
  phone_verified: boolean;
  two_factor_enabled: boolean;
  exp: number;
  iat: number;
}

class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: AuthUser | null = null;

  private constructor() {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
      this.user = this.getUserFromToken();
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private getUserFromToken(): AuthUser | null {
    if (!this.accessToken) return null;

    try {
      // Try to decode JWT token
      const decoded = jwtDecode<DecodedToken>(this.accessToken);
      
      return {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
        kyc_level: decoded.kyc_level,
        email_verified: decoded.email_verified,
        phone_verified: decoded.phone_verified,
        two_factor_enabled: decoded.two_factor_enabled,
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      // Fallback to default user if token decoding fails
      return {
        id: 'default',
        email: 'user@example.com',
        role: 'member',
        kyc_level: 0,
        email_verified: false,
        phone_verified: false,
        two_factor_enabled: false,
      };
    }
  }

  private isTokenExpired(token: string): boolean {
    // For now, since we're using simple tokens, we'll assume they don't expire
    // In the future, this should properly decode JWT tokens
    return false;
  }

  public async login(email: string, password: string, otpCode?: string): Promise<{ success: boolean; user: AuthUser; token: string }> {
    const { env } = await import('./env');
    const authServiceUrl = env.NEXT_PUBLIC_AUTH_SERVICE_URL;
    
    const response = await fetch(`${authServiceUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        two_factor_code: otpCode,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Login failed';
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || 'Login failed';
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
        errorMessage = `Login failed (${response.status}: ${response.statusText})`;
      }
      throw new Error(errorMessage);
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse login response:', parseError);
      throw new Error('Invalid response from server');
    }
    
    this.accessToken = data.token;
    this.refreshToken = data.token; // Using same token for now since our auth service doesn't have refresh tokens yet
    
    // Create user object from response data
    this.user = {
      id: data.user.id,
      email: data.user.email,
      role: 'member', // Default role for now
      kyc_level: 0, // Default KYC level
      email_verified: data.user.email_verified || false,
      phone_verified: false, // Default to false
      two_factor_enabled: false, // Default to false
    };

    // Store tokens in localStorage
    if (typeof window !== 'undefined' && this.accessToken && this.refreshToken) {
      localStorage.setItem('access_token', this.accessToken);
      localStorage.setItem('refresh_token', this.refreshToken);
    }

    return {
      success: true,
      user: this.user,
      token: this.accessToken || ''
    };
  }

  public async register(userData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
    country: string;
    marketing_consent: boolean;
    terms_accepted: boolean;
  }): Promise<void> {
    const { env } = await import('./env');
    const authServiceUrl = env.NEXT_PUBLIC_AUTH_SERVICE_URL;
    
    const response = await fetch(`${authServiceUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      let errorMessage = 'Registration failed';
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || 'Registration failed';
      } catch (parseError) {
        console.error('Failed to parse registration error response:', parseError);
        errorMessage = `Registration failed (${response.status}: ${response.statusText})`;
      }
      throw new Error(errorMessage);
    }
  }

  public async logout(): Promise<void> {
    const { env } = await import('./env');
    const authServiceUrl = env.NEXT_PUBLIC_AUTH_SERVICE_URL;
    
    if (this.accessToken) {
      try {
        await fetch(`${authServiceUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        });
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }

    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  public async refreshAccessToken(): Promise<{ success: boolean; user: AuthUser; token: string } | null> {
    if (!this.refreshToken) return null;

    const { env } = await import('./env');
    const authServiceUrl = env.NEXT_PUBLIC_AUTH_SERVICE_URL;
    
    try {
      const response = await fetch(`${authServiceUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: this.refreshToken,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Token refresh failed';
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || 'Token refresh failed';
        } catch (parseError) {
          console.error('Failed to parse token refresh error:', parseError);
          errorMessage = `Token refresh failed (${response.status}: ${response.statusText})`;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse token refresh response:', parseError);
        throw new Error('Invalid response from token refresh');
      }
      
      this.accessToken = data.access_token;
      this.user = this.getUserFromToken();

      if (typeof window !== 'undefined' && this.accessToken) {
        localStorage.setItem('access_token', this.accessToken);
      }

      return {
        success: true,
        user: this.user!,
        token: this.accessToken || ''
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.logout();
      return null;
    }
  }

  public async getAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    let token = this.accessToken;

    // Check if token is expired and refresh if needed
    if (token && this.isTokenExpired(token)) {
      const refreshResult = await this.refreshAccessToken();
      token = refreshResult?.token || null;
    }

    if (!token) {
      throw new Error('No valid authentication token');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });

    // If token is invalid, try to refresh once
    if (response.status === 401) {
      const refreshResult = await this.refreshAccessToken();
      if (refreshResult?.token) {
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${refreshResult.token}`,
          },
        });
      }
    }

    return response;
  }

  public getUser(): AuthUser | null {
    return this.user;
  }

  public isAuthenticated(): boolean {
    return !!this.accessToken && !this.isTokenExpired(this.accessToken);
  }

  public hasRole(role: string): boolean {
    return this.user?.role === role;
  }

  public hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.user?.role || '');
  }

  public getKycLevel(): number {
    return this.user?.kyc_level || 0;
  }

  public isEmailVerified(): boolean {
    return this.user?.email_verified || false;
  }

  public isPhoneVerified(): boolean {
    return this.user?.phone_verified || false;
  }

  public isTwoFactorEnabled(): boolean {
    return this.user?.two_factor_enabled || false;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }
}

export const authService = AuthService.getInstance();

// React hook for authentication state
export const useAuth = () => {
  return {
    user: authService.getUser(),
    isAuthenticated: authService.isAuthenticated(),
    login: authService.login.bind(authService),
    logout: authService.logout.bind(authService),
    register: authService.register.bind(authService),
    hasRole: authService.hasRole.bind(authService),
    hasAnyRole: authService.hasAnyRole.bind(authService),
    getKycLevel: authService.getKycLevel.bind(authService),
    isEmailVerified: authService.isEmailVerified.bind(authService),
    isPhoneVerified: authService.isPhoneVerified.bind(authService),
    isTwoFactorEnabled: authService.isTwoFactorEnabled.bind(authService),
  };
};

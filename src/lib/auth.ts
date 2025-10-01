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
    const { authAPI } = await import('./api/auth');
    
    try {
      const response = await authAPI.login({
        email,
        password,
        ...(otpCode && { otp_code: otpCode }),
      });
      
      // Convert Orbisigner user to AuthUser format
      const profile = response.user.profiles[0] || {};
      this.user = {
        id: response.user.uid,
        email: response.user.email,
        role: response.user.role || 'member',
        kyc_level: response.user.level || 0,
        email_verified: response.user.state === 'active',
        phone_verified: response.user.phones.length > 0,
        two_factor_enabled: response.user.otp || false,
      };

      // Use the generated JWT token for Orbitex-Clean API access
      this.accessToken = response.jwt_token || '';
      this.refreshToken = response.user.csrf_token; // Use CSRF token as refresh token

      // Store tokens in localStorage
      if (typeof window !== 'undefined' && this.accessToken) {
        localStorage.setItem('access_token', this.accessToken);
        localStorage.setItem('refresh_token', this.refreshToken || '');
        localStorage.setItem('user', JSON.stringify(this.user));
      }

      return {
        success: true,
        user: this.user,
        token: this.accessToken
      };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  public async register(userData: {
    email: string;
    password: string;
    username?: string;
    recaptcha_response?: string;
    refid?: string;
    data?: string;
  }): Promise<void> {
    const { authAPI } = await import('./api/auth');
    
    try {
      const response = await authAPI.register(userData);
      
      // Convert Orbisigner user to AuthUser format
      const profile = response.user.profiles[0] || {};
      this.user = {
        id: response.user.uid,
        email: response.user.email,
        role: response.user.role || 'member',
        kyc_level: response.user.level || 0,
        email_verified: response.user.state === 'active',
        phone_verified: response.user.phones.length > 0,
        two_factor_enabled: response.user.otp || false,
      };

      // Use the generated JWT token for Orbitex-Clean API access
      this.accessToken = response.jwt_token || '';
      this.refreshToken = response.user.csrf_token; // Use CSRF token as refresh token

      // Store tokens in localStorage
      if (typeof window !== 'undefined' && this.accessToken) {
        localStorage.setItem('access_token', this.accessToken);
        localStorage.setItem('refresh_token', this.refreshToken || '');
        localStorage.setItem('user', JSON.stringify(this.user));
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    const { authAPI } = await import('./api/auth');
    
    if (this.accessToken) {
      try {
        await authAPI.logout(this.accessToken);
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
      // V2 identity may not have refresh endpoint; validate current token
      const response = await fetch(`${authServiceUrl}/ping`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
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
      
      this.accessToken = this.accessToken || null;
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
    // Check if we have a demo token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && token.startsWith('demo_token_')) {
        // Return demo user
        return {
          id: 'demo_user_123',
          email: 'demo@orbitex.com',
          role: 'member',
          kyc_level: 2,
          email_verified: true,
          phone_verified: true,
          two_factor_enabled: false,
        };
      }
    }
    
    return this.user;
  }

  public isAuthenticated(): boolean {
    // Check if we have a demo token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && token.startsWith('demo_token_')) {
        return true;
      }
    }
    
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

export { AuthService };
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

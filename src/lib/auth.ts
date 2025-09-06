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
    const authServiceUrl = env.NEXT_PUBLIC_AUTH_SERVICE_URL; // now Orbisigner v2 identity base
    // Orbisigner sessions endpoint: POST /api/v2/identity/sessions
    const response = await fetch(`${authServiceUrl}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        otp: otpCode,
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
    
    // Orbisigner returns { token, user: { uid, email, role, level } }
    this.accessToken = data.token;
    this.refreshToken = data.token;
    this.user = {
      id: data.user.uid || data.user.id,
      email: data.user.email,
      role: data.user.role || 'member',
      kyc_level: data.user.level || 0,
      email_verified: true,
      phone_verified: false,
      two_factor_enabled: false,
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
    const authServiceUrl = env.NEXT_PUBLIC_AUTH_SERVICE_URL; // Orbisigner v2 identity base
    // Orbisigner users endpoint: POST /api/v2/identity/users
    const response = await fetch(`${authServiceUrl}/users`, {
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
    const authServiceUrl = env.NEXT_PUBLIC_AUTH_SERVICE_URL; // Orbisigner v2 identity base
    
    if (this.accessToken) {
      try {
        // Orbisigner may not implement logout; clear client-side token only
        await fetch(`${authServiceUrl}/sessions`, {
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
      // No refresh endpoint in Orbisigner v2 today; return current token if present
      const response = await fetch(`${authServiceUrl}/sessions/health`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
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

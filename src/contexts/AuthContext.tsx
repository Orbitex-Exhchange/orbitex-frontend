'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authAPI, User, AuthTokens, LoginRequest, RegisterRequest } from '@/lib/api/auth';

// Types
export interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded = jwtDecode(token);
      if (decoded && typeof decoded === 'object' && 'exp' in decoded) {
        const exp = decoded.exp as number;
        return Date.now() >= exp * 1000;
      }
      return true;
    } catch {
      return true;
    }
  };

  // Load user from token
  const loadUserFromToken = async (token: string) => {
    try {
      const userData = await authAPI.getProfile(token);
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user from token:', error);
      // Token might be invalid, clear auth state
      setUser(null);
      setTokens(null);
      localStorage.removeItem('auth_tokens');
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedTokens = localStorage.getItem('auth_tokens');
        
        if (storedTokens) {
          const parsedTokens: AuthTokens = JSON.parse(storedTokens);
          
          if (!isTokenExpired(parsedTokens.access_token)) {
            setTokens(parsedTokens);
            await loadUserFromToken(parsedTokens.access_token);
          } else if (parsedTokens.refresh_token) {
            // Try to refresh the token
            try {
              const newTokens = await authAPI.refreshToken(parsedTokens.refresh_token);
              setTokens(newTokens);
              localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
              await loadUserFromToken(newTokens.access_token);
            } catch (error) {
              console.error('Failed to refresh token:', error);
              localStorage.removeItem('auth_tokens');
            }
          } else {
            localStorage.removeItem('auth_tokens');
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('auth_tokens');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (data: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(data);
      
      const authTokens: AuthTokens = {
        access_token: response.token,
        refresh_token: response.token, // In a real implementation, this would be separate
        expires_in: 3600, // 1 hour
      };
      
      setTokens(authTokens);
      setUser(response.user);
      localStorage.setItem('auth_tokens', JSON.stringify(authTokens));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(data);
      
      const authTokens: AuthTokens = {
        access_token: response.token,
        refresh_token: response.token, // In a real implementation, this would be separate
        expires_in: 3600, // 1 hour
      };
      
      setTokens(authTokens);
      setUser(response.user);
      localStorage.setItem('auth_tokens', JSON.stringify(authTokens));
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (tokens?.access_token) {
        await authAPI.logout(tokens.access_token);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setTokens(null);
      localStorage.removeItem('auth_tokens');
    }
  };

  // Refresh auth function
  const refreshAuth = async () => {
    if (!tokens?.refresh_token) return;
    
    try {
      const newTokens = await authAPI.refreshToken(tokens.refresh_token);
      setTokens(newTokens);
      localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
      await loadUserFromToken(newTokens.access_token);
    } catch (error) {
      console.error('Failed to refresh auth:', error);
      await logout();
    }
  };

  // Update user function
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    tokens,
    isAuthenticated: !!user && !!tokens,
    isLoading,
    login,
    register,
    logout,
    refreshAuth,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook to check if user has specific role
export function useHasRole(role: User['role']) {
  const { user } = useAuth();
  return user?.role === role;
}

// Hook to check if user has specific permission level
export function useHasPermission(requiredLevel: number) {
  const { user } = useAuth();
  return user ? user.kyc_level >= requiredLevel : false;
}

// Hook to check if user is admin
export function useIsAdmin() {
  return useHasRole('admin');
}

// Hook to check if user is compliance officer
export function useIsCompliance() {
  return useHasRole('compliance');
}

// Hook to check if user is operator
export function useIsOperator() {
  return useHasRole('operator');
}

// Hook to check if user is support
export function useIsSupport() {
  return useHasRole('support');
}

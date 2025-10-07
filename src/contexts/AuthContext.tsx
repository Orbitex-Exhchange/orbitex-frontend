'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, AuthUser } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  authToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (userData: Partial<AuthUser>) => void;
  refreshAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('access_token');
      const currentUser = authService.getUser();
      
      if (token && currentUser) {
        setAuthToken(token);
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        // Clear any invalid tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('demo_user_email');
        setAuthToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    initializeAuth();

    // Listen for storage changes (e.g., from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        initializeAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await authService.login(email, password);
      if (result.success && result.token) {
        localStorage.setItem('access_token', result.token);
        if (result.refreshToken) {
          localStorage.setItem('refresh_token', result.refreshToken);
        }
        setAuthToken(result.token);
        setUser(result.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('demo_user_email');
      setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const result = await authService.refreshAccessToken();
      if (result?.success && result.token) {
        localStorage.setItem('access_token', result.token);
        setAuthToken(result.token);
        setUser(result.user);
        setIsAuthenticated(true);
      } else {
        // Token refresh failed, logout user
        await logout();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  };

  const updateUser = (userData: Partial<AuthUser>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
    }
  };

  const refreshAuthState = () => {
    const token = localStorage.getItem('access_token');
    const currentUser = authService.getUser();

    if (token && currentUser) {
      setAuthToken(token);
      setUser(currentUser);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('demo_user_email');
      setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    authToken,
    login,
    logout,
    refreshToken,
    updateUser,
    refreshAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

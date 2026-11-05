'use client';

import React, { createContext, useCallback, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authService, type AuthUser, type DecodedToken } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  authToken: string | null;
  login: (email: string, password: string, otpCode?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (userData: Partial<AuthUser>) => void;
  refreshAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function removeCookie(name: string): void {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function setCookie(name: string, value: string, days = 1): void {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

function normalizeUser(rawUser: unknown, token?: string): AuthUser | null {
  if (!rawUser || typeof rawUser !== 'object') return token ? userFromToken(token) : null;

  const source = rawUser as Partial<AuthUser> & {
    uid?: string;
    sub?: string;
    level?: number | string;
    state?: string;
    otp?: boolean;
    phones?: unknown[];
  };
  const email = source.email || '';
  const kycLevel = Number(source.kyc_level ?? source.level ?? 0);

  return {
    id: source.id || source.uid || source.sub || email || 'unknown',
    email,
    role: source.role || 'member',
    kyc_level: Number.isFinite(kycLevel) ? kycLevel : 0,
    email_verified: source.email_verified ?? source.state === 'active',
    phone_verified: source.phone_verified ?? (Array.isArray(source.phones) && source.phones.length > 0),
    two_factor_enabled: source.two_factor_enabled ?? source.otp ?? false,
  };
}

function userFromToken(token: string): AuthUser | null {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (!decoded.exp || decoded.exp * 1000 <= Date.now() + 30_000) return null;

    const kycLevel = Number(decoded.kyc_level ?? decoded.level ?? 0);
    return {
      id: decoded.uid || decoded.sub || decoded.email || 'unknown',
      email: decoded.email || '',
      role: decoded.role || 'member',
      kyc_level: Number.isFinite(kycLevel) ? kycLevel : 0,
      email_verified: decoded.email_verified ?? decoded.state === 'active',
      phone_verified: decoded.phone_verified ?? false,
      two_factor_enabled: decoded.two_factor_enabled ?? decoded.otp ?? false,
    };
  } catch (error) {
    console.error('Failed to decode stored auth token:', error);
    return null;
  }
}

function readPersistedAuth(): { token: string; user: AuthUser } | null {
  const token = localStorage.getItem('access_token');
  if (!token) return null;

  let storedUser: AuthUser | null = null;
  try {
    const rawUser = localStorage.getItem('user');
    storedUser = rawUser ? normalizeUser(JSON.parse(rawUser), token) : null;
  } catch (error) {
    console.error('Failed to parse stored auth user:', error);
  }

  const user = storedUser || userFromToken(token);
  return user ? { token, user } : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const clearAuthState = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    removeCookie('access_token');
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const applyPersistedAuth = useCallback((notify = false) => {
    const restoredByService = authService.syncFromStorage();
    const persisted = restoredByService || readPersistedAuth();

    if (persisted) {
      setCookie('access_token', persisted.token, 1);
      localStorage.setItem('access_token', persisted.token);
      localStorage.setItem('user', JSON.stringify(persisted.user));
      setAuthToken(persisted.token);
      setUser(persisted.user);
      setIsAuthenticated(true);
    } else {
      clearAuthState();
    }

    setIsAuthReady(true);

    if (notify) {
      window.dispatchEvent(new Event('auth:changed'));
    }
  }, [clearAuthState]);

  // Initialize auth state on mount
  useEffect(() => {
    applyPersistedAuth(false);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' || e.key === 'refresh_token' || e.key === 'user') {
        applyPersistedAuth(false);
      }
    };
    const handleAuthChanged = () => applyPersistedAuth(false);

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:changed', handleAuthChanged);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:changed', handleAuthChanged);
    };
  }, [applyPersistedAuth]);

  const login = async (email: string, password: string, otpCode?: string): Promise<boolean> => {
    const result = await authService.login(email, password, otpCode);

    if (result.success && result.token && result.user) {
      localStorage.setItem('access_token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      setCookie('access_token', result.token, 1);
      setAuthToken(result.token);
      setUser(result.user);
      setIsAuthenticated(true);
      setIsAuthReady(true);
      window.dispatchEvent(new Event('auth:changed'));
      return true;
    }

    return false;
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthState();
      setIsAuthReady(true);
      window.dispatchEvent(new Event('auth:changed'));
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const result = await authService.refreshAccessToken();
      if (result?.success && result.token) {
        localStorage.setItem('access_token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        setCookie('access_token', result.token, 1);
        setAuthToken(result.token);
        setUser(result.user);
        setIsAuthenticated(true);
        setIsAuthReady(true);
        window.dispatchEvent(new Event('auth:changed'));
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
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const refreshAuthState = () => {
    applyPersistedAuth(true);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isAuthReady,
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

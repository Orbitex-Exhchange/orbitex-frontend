import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// ===== TYPES =====

export interface User {
  id: string;
  email: string;
  role: string;
  level: number;
  state: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// ===== AUTH STORE =====

export const useAuthStore = create<AuthState & AuthActions>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    // Actions
    setUser: (user: User | null) => {
      set({ 
        user, 
        isAuthenticated: !!user,
        error: null 
      });
    },

    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },

    setError: (error: string | null) => {
      set({ error });
    },

    login: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        set({ 
          user: data.user, 
          isAuthenticated: true, 
          isLoading: false,
          error: null 
        });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Login failed',
          isLoading: false 
        });
      }
    },

    logout: () => {
      set({ 
        user: null, 
        isAuthenticated: false, 
        error: null 
      });
    },

    clearError: () => {
      set({ error: null });
    },
  }))
);

// ===== SELECTORS =====

export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

// ===== ACTIONS =====

export const authActions = {
  setUser: useAuthStore.getState().setUser,
  setLoading: useAuthStore.getState().setLoading,
  setError: useAuthStore.getState().setError,
  login: useAuthStore.getState().login,
  logout: useAuthStore.getState().logout,
  clearError: useAuthStore.getState().clearError,
};

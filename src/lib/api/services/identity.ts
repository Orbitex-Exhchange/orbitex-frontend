import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import {
  V2IdentityConfig,
  V2IdentityUser,
  V2IdentitySession,
  ApiResponse
} from '../types/v2';

// Identity API endpoints - Updated to match V2 API structure
const IDENTITY_ENDPOINTS = {
  ping: '/api/v2/identity/ping',
  configs: '/api/v2/identity/configs',
  sessions: '/api/v2/identity/sessions',
  users: '/api/v2/identity/users',
} as const;

// Real V2 API functions
const v2Api = {
  ping: async (): Promise<{ message: string }> => {
    const response = await apiClient.get<{ message: string }>(IDENTITY_ENDPOINTS.ping);
    return response.data;
  },

  getConfigs: async (): Promise<V2IdentityConfig> => {
    const response = await apiClient.get<V2IdentityConfig>(IDENTITY_ENDPOINTS.configs);
    return response.data;
  },

  createSession: async (credentials: {
    email: string;
    password: string;
    otp_code?: string;
    recaptcha_response?: string;
  }): Promise<V2IdentitySession> => {
    const response = await apiClient.post<V2IdentitySession>(IDENTITY_ENDPOINTS.sessions, credentials);
    return response.data;
  },

  deleteSession: async (): Promise<void> => {
    await apiClient.delete(IDENTITY_ENDPOINTS.sessions);
  },

  createUser: async (userData: {
    email: string;
    password: string;
    password_confirmation: string;
    recaptcha_response?: string;
    refid?: string;
  }): Promise<V2IdentityUser> => {
    const response = await apiClient.post<V2IdentityUser>(IDENTITY_ENDPOINTS.users, userData);
    return response.data;
  },

  generateEmailCode: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`${IDENTITY_ENDPOINTS.users}/email_code`, { email });
    return response.data;
  },

  generatePasswordCode: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`${IDENTITY_ENDPOINTS.users}/password_code`, { email });
    return response.data;
  },

  confirmPasswordCode: async (data: {
    email: string;
    code: string;
  }): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`${IDENTITY_ENDPOINTS.users}/confirm_password_code`, data);
    return response.data;
  },
};

// React Query hooks
export const useIdentityPing = () => {
  return useQuery({
    queryKey: ['identity', 'ping'],
    queryFn: v2Api.ping,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useIdentityConfigs = () => {
  return useQuery({
    queryKey: ['identity', 'configs'],
    queryFn: v2Api.getConfigs,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: v2Api.createSession,
    onSuccess: (session) => {
      // Store tokens in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', session.access_token);
        localStorage.setItem('refresh_token', session.refresh_token);
        localStorage.setItem('user', JSON.stringify(session.user));
      }
      
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: v2Api.deleteSession,
    onSuccess: () => {
      // Clear tokens from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
      
      // Clear all queries
      queryClient.clear();
    },
  });
};

export const useCreateUser = () => {
  return useMutation({
    mutationFn: v2Api.createUser,
  });
};

export const useGenerateEmailCode = () => {
  return useMutation({
    mutationFn: v2Api.generateEmailCode,
  });
};

export const useGeneratePasswordCode = () => {
  return useMutation({
    mutationFn: v2Api.generatePasswordCode,
  });
};

export const useConfirmPasswordCode = () => {
  return useMutation({
    mutationFn: v2Api.confirmPasswordCode,
  });
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { 
  IdentityUser, 
  IdentitySession, 
  IdentityConfig,
  mockIdentityUsers 
} from '../mock-data/enhanced';

// Identity API endpoints
const IDENTITY_ENDPOINTS = {
  ping: '/api/v2/barong/identity/ping',
  configs: '/api/v2/barong/identity/configs',
  sessions: '/api/v2/barong/identity/sessions',
  users: '/api/v2/barong/identity/users',
} as const;

// Mock API functions
const mockApi = {
  ping: async (): Promise<{ message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { message: 'pong' };
  },

  getConfigs: async (): Promise<IdentityConfig> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      captcha_type: 'none',
      session_timeout: 3600,
      password_min_entropy: 14,
    };
  },

  createSession: async (credentials: {
    email: string;
    password: string;
    otp_code?: string;
    recaptcha_response?: string;
  }): Promise<IdentitySession> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = mockIdentityUsers.find(u => u.email === credentials.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    return {
      access_token: `access_token_${Date.now()}`,
      refresh_token: `refresh_token_${Date.now()}`,
      token_type: 'Bearer',
      expires_in: 3600,
      user,
    };
  },

  deleteSession: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    // In a real app, this would invalidate the token
  },

  createUser: async (userData: {
    email: string;
    password: string;
    password_confirmation: string;
    recaptcha_response?: string;
    refid?: string;
  }): Promise<IdentityUser> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: IdentityUser = {
      id: Date.now().toString(),
      email: userData.email,
      username: userData.email.split('@')[0],
      role: 'member',
      level: 1,
      otp: false,
      state: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return newUser;
  },

  generateEmailCode: async (email: string): Promise<{ message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Email code sent successfully' };
  },

  generatePasswordCode: async (email: string): Promise<{ message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Password reset code sent successfully' };
  },

  confirmPasswordCode: async (data: {
    email: string;
    code: string;
  }): Promise<{ message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Password reset code confirmed successfully' };
  },
};

// React Query hooks
export const useIdentityPing = () => {
  return useQuery({
    queryKey: ['identity', 'ping'],
    queryFn: mockApi.ping,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useIdentityConfigs = () => {
  return useQuery({
    queryKey: ['identity', 'configs'],
    queryFn: mockApi.getConfigs,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockApi.createSession,
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
    mutationFn: mockApi.deleteSession,
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
    mutationFn: mockApi.createUser,
  });
};

export const useGenerateEmailCode = () => {
  return useMutation({
    mutationFn: mockApi.generateEmailCode,
  });
};

export const useGeneratePasswordCode = () => {
  return useMutation({
    mutationFn: mockApi.generatePasswordCode,
  });
};

export const useConfirmPasswordCode = () => {
  return useMutation({
    mutationFn: mockApi.confirmPasswordCode,
  });
};

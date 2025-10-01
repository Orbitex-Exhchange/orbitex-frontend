import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { env } from '@/lib/env';
import { OrbisignerUser, AuthResponse } from '../auth';

// Identity API endpoints - Direct to Orbisigner
const IDENTITY_ENDPOINTS = {
  ping: '/ping',
  configs: '/configs',
  sessions: '/sessions',
  users: '/users',
} as const;

// Create a direct fetch client for Orbisigner API
const orbisignerClient = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${env.NEXT_PUBLIC_AUTH_SERVICE_URL}${endpoint}`;
    
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
      console.error('Orbisigner API request failed:', error);
      throw error;
    }
  }
};

// Orbisigner API functions
const orbisignerApi = {
  ping: async (): Promise<{ message: string }> => {
    return orbisignerClient.request<{ message: string }>(IDENTITY_ENDPOINTS.ping, {
      method: 'GET',
    });
  },

  getConfigs: async (): Promise<any> => {
    return orbisignerClient.request<any>(IDENTITY_ENDPOINTS.configs, {
      method: 'GET',
    });
  },

         createSession: async (credentials: {
           email: string;
           password: string;
           otp_code?: string;
           recaptcha_response?: string;
         }): Promise<AuthResponse> => {
           const user = await orbisignerClient.request<OrbisignerUser>(IDENTITY_ENDPOINTS.sessions, {
             method: 'POST',
             body: JSON.stringify(credentials),
           });
           
           // Generate JWT token for Orbitex-Clean API access
           const jwtToken = await generateJWTToken(user);
           
           return {
             user,
             jwt_token: jwtToken
           };
         },

  deleteSession: async (token: string): Promise<void> => {
    await orbisignerClient.request(IDENTITY_ENDPOINTS.sessions, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

         createUser: async (userData: {
           email: string;
           password: string;
           password_confirmation: string;
           recaptcha_response?: string;
           refid?: string;
         }): Promise<AuthResponse> => {
           const user = await orbisignerClient.request<OrbisignerUser>(IDENTITY_ENDPOINTS.users, {
             method: 'POST',
             body: JSON.stringify(userData),
           });
           
           // Generate JWT token for Orbitex-Clean API access
           const jwtToken = await generateJWTToken(user);
           
           return {
             user,
             jwt_token: jwtToken
           };
         },

  generateEmailCode: async (email: string): Promise<{ message: string }> => {
    return orbisignerClient.request<{ message: string }>(`${IDENTITY_ENDPOINTS.users}/email_code`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  generatePasswordCode: async (email: string): Promise<{ message: string }> => {
    return orbisignerClient.request<{ message: string }>(`${IDENTITY_ENDPOINTS.users}/password_code`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  confirmPasswordCode: async (data: {
    email: string;
    code: string;
  }): Promise<{ message: string }> => {
    return orbisignerClient.request<{ message: string }>(`${IDENTITY_ENDPOINTS.users}/confirm_password_code`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Generate JWT token for Orbitex-Clean API access
async function generateJWTToken(user: OrbisignerUser): Promise<string> {
  const payload = {
    uid: user.uid,
    email: user.email,
    username: user.username || user.email.split('@')[0],
    role: user.role,
    level: user.level,
    state: user.state,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (1 * 60 * 60), // 1 hour
    iss: 'Orbisigner',
    aud: 'Orbitex',
    sub: 'session',
    jti: Math.random().toString(36).substring(2, 15)
  };

  // Use jose library for browser-compatible JWT signing
  const { SignJWT } = await import('jose');
  const secret = new TextEncoder().encode('6d69b7b372c13d635ed4abd69b7a7b30edcaa7eeda14e3970c5f1b4ae24b9258542476e3b4a01550a44d1e5d948f4ac0d44ebc2e2b36cb691504516fd0ab508e');
  
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .setIssuer('Orbisigner')
    .setAudience('Orbitex')
    .setSubject('session')
    .setJti(payload.jti)
    .sign(secret);
  
  return jwt;
}

// React Query hooks
export const useIdentityPing = () => {
  return useQuery({
    queryKey: ['identity', 'ping'],
    queryFn: orbisignerApi.ping,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useIdentityConfigs = () => {
  return useQuery({
    queryKey: ['identity', 'configs'],
    queryFn: orbisignerApi.getConfigs,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: orbisignerApi.createSession,
    onSuccess: (response) => {
      // Store tokens in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', response.jwt_token || '');
        localStorage.setItem('refresh_token', response.user.csrf_token);
        localStorage.setItem('user', JSON.stringify(response.user));
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
    mutationFn: (token: string) => orbisignerApi.deleteSession(token),
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
    mutationFn: orbisignerApi.createUser,
  });
};

export const useGenerateEmailCode = () => {
  return useMutation({
    mutationFn: orbisignerApi.generateEmailCode,
  });
};

export const useGeneratePasswordCode = () => {
  return useMutation({
    mutationFn: orbisignerApi.generatePasswordCode,
  });
};

export const useConfirmPasswordCode = () => {
  return useMutation({
    mutationFn: orbisignerApi.confirmPasswordCode,
  });
};
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
// Orbisigner API functions - Standalone (No ObjectWrapper to avoid TDZ)
export const ping = async (): Promise<{ message: string }> => {
  return orbisignerClient.request<{ message: string }>(IDENTITY_ENDPOINTS.ping, {
    method: 'GET',
  });
};

export const getConfigs = async (): Promise<any> => {
  return orbisignerClient.request<any>(IDENTITY_ENDPOINTS.configs, {
    method: 'GET',
  });
};

export const createSession = async (credentials: {
  email: string;
  password: string;
  otp_code?: string;
  recaptcha_response?: string;
}): Promise<AuthResponse> => {
  // Orbisigner returns jwt_token in the response
  const response = await orbisignerClient.request<OrbisignerUser & { jwt_token?: string }>(IDENTITY_ENDPOINTS.sessions, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  // Use the JWT token from Orbisigner directly (RS256 signed)
  // instead of generating our own HS256 token
  const jwtToken = response.jwt_token;

  if (!jwtToken) {
    console.error('No jwt_token in Orbisigner response');
    throw new Error('Authentication failed: No token received');
  }

  return {
    user: response,
    jwt_token: jwtToken
  };
};

export const deleteSession = async (token: string): Promise<void> => {
  await orbisignerClient.request(IDENTITY_ENDPOINTS.sessions, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const createUser = async (userData: {
  email: string;
  password: string;
  password_confirmation?: string;
  recaptcha_response?: string;
  refid?: string;
}): Promise<AuthResponse> => {
  // Orbisigner returns user data but may not include jwt_token for pending users
  const response = await orbisignerClient.request<OrbisignerUser & { jwt_token?: string }>(IDENTITY_ENDPOINTS.users, {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  // For registration, jwt_token may not be present if email verification is required
  // User will get token after email confirmation via login
  const jwtToken = response.jwt_token || '';

  return {
    user: response,
    jwt_token: jwtToken
  };
};

export const generateEmailCode = async (email: string): Promise<{ message: string }> => {
  return orbisignerClient.request<{ message: string }>(`${IDENTITY_ENDPOINTS.users}/email_code`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const generatePasswordCode = async (email: string): Promise<{ message: string }> => {
  return orbisignerClient.request<{ message: string }>(`${IDENTITY_ENDPOINTS.users}/password_code`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const confirmPasswordCode = async (data: {
  email: string;
  code: string;
}): Promise<{ message: string }> => {
  return orbisignerClient.request<{ message: string }>(`${IDENTITY_ENDPOINTS.users}/confirm_password_code`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Generate JWT token for Orbitex-Clean API access
// Exporting this as a standalone function too
export async function generateJWTToken(user: OrbisignerUser): Promise<string> {
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
    queryFn: ping,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useIdentityConfigs = () => {
  return useQuery({
    queryKey: ['identity', 'configs'],
    queryFn: getConfigs,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSession,
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
    mutationFn: (token: string) => deleteSession(token),
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
    mutationFn: createUser,
  });
};

export const useGenerateEmailCode = () => {
  return useMutation({
    mutationFn: generateEmailCode,
  });
};

export const useGeneratePasswordCode = () => {
  return useMutation({
    mutationFn: generatePasswordCode,
  });
};

export const useConfirmPasswordCode = () => {
  return useMutation({
    mutationFn: confirmPasswordCode,
  });
};
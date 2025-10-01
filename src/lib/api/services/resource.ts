import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { 
  UserProfile, 
  ApiKey, 
  Label, 
  Document, 
  Phone,
  mockUserProfiles,
  mockApiKeys,
  mockLabels,
  mockDocuments,
  mockPhones
} from '../mock-data/enhanced';

// Resource API endpoints
const RESOURCE_ENDPOINTS = {
  userProfile: '/api/v2/resource/users/me',
  updateProfile: '/api/v2/resource/users',
  apiKeys: '/api/v2/resource/api_keys',
  labels: '/api/v2/resource/labels',
  documents: '/api/v2/resource/documents',
  phones: '/api/v2/resource/phones',
  otp: '/api/v2/resource/otp',
  profiles: '/api/v2/resource/profiles',
} as const;

// Mock API functions
const mockApi = {
  getUserProfile: async (): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const profile = mockUserProfiles[0];
    if (!profile) {
      throw new Error('User profile not found');
    }
    return profile;
  },

  updateUserProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const currentProfile = mockUserProfiles[0];
    if (!currentProfile) {
      throw new Error('User profile not found');
    }

    const updatedProfile = { ...currentProfile, ...data, updated_at: new Date().toISOString() };
    
    // Ensure all required properties are present
    return {
      id: updatedProfile.id || currentProfile.id,
      email: updatedProfile.email || currentProfile.email,
      username: updatedProfile.username || currentProfile.username,
      profile: updatedProfile.profile || currentProfile.profile,
      documents: updatedProfile.documents || currentProfile.documents,
      labels: updatedProfile.labels || currentProfile.labels,
      phones: updatedProfile.phones || currentProfile.phones,
      created_at: updatedProfile.created_at || currentProfile.created_at,
      updated_at: updatedProfile.updated_at,
      state: updatedProfile.state || currentProfile.state,
      referral_id: updatedProfile.referral_id || currentProfile.referral_id,
      level: updatedProfile.level || currentProfile.level,
      otp: updatedProfile.otp ?? currentProfile.otp,
      role: updatedProfile.role || currentProfile.role,
      data: updatedProfile.data || currentProfile.data,
    };
  },

  getApiKeys: async (): Promise<ApiKey[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockApiKeys;
  },

  createApiKey: async (data: {
    algorithm: 'HS256' | 'RS256';
    totp_code?: string;
  }): Promise<ApiKey> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newApiKey: ApiKey = {
      id: Date.now().toString(),
      kid: `api_key_${Date.now()}`,
      algorithm: data.algorithm,
      scope: ['read', 'trade'],
      state: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return newApiKey;
  },

  updateApiKey: async (id: string, data: {
    state: 'active' | 'inactive';
    totp_code?: string;
  }): Promise<ApiKey> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const apiKey = mockApiKeys.find(k => k.id === id);
    if (!apiKey) {
      throw new Error('API key not found');
    }

    return { ...apiKey, ...data, updated_at: new Date().toISOString() };
  },

  deleteApiKey: async (id: string, totp_code?: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // In a real app, this would delete the API key
  },

  getLabels: async (): Promise<Label[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockLabels;
  },

  getDocuments: async (): Promise<Document[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDocuments;
  },

  uploadDocument: async (data: {
    doc_type: string;
    doc_number: string;
    doc_expire: string;
    upload: string;
    metadata?: Record<string, any>;
  }): Promise<Document> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newDocument: Document = {
      id: Date.now().toString(),
      upload: data.upload,
      doc_type: data.doc_type,
      doc_number: data.doc_number,
      doc_expire: data.doc_expire,
      metadata: data.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return newDocument;
  },

  getPhones: async (): Promise<Phone[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPhones;
  },

  createPhone: async (data: {
    country: string;
    number: string;
  }): Promise<Phone> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newPhone: Phone = {
      id: Date.now().toString(),
      country: data.country,
      number: data.number,
      validated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return newPhone;
  },

  generateOtpQrCode: async (): Promise<{
    barcode: string;
    qr_url: string;
  }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      barcode: 'otpauth://totp/Mobidax:user@mobidax.com?secret=JBSWY3DPEHPK3PXP&issuer=Mobidax',
      qr_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    };
  },

  enableOtp: async (code: string): Promise<{ message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'OTP enabled successfully' };
  },

  updateProfile: async (data: {
    first_name?: string;
    last_name?: string;
    dob?: string;
    address?: string;
    postcode?: string;
    city?: string;
    country?: string;
    state?: string;
    phone?: string;
  }): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const currentProfile = mockUserProfiles[0];
    if (!currentProfile) {
      throw new Error('User profile not found');
    }

    return {
      ...currentProfile,
      profile: { ...currentProfile.profile, ...data },
      updated_at: new Date().toISOString(),
    };
  },

  changePassword: async (data: {
    old_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<{ message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Password changed successfully' };
  },
};

// React Query hooks
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: mockApi.getUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockApi.updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};

export const useApiKeys = () => {
  return useQuery({
    queryKey: ['user', 'api_keys'],
    queryFn: mockApi.getApiKeys,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateApiKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockApi.createApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'api_keys'] });
    },
  });
};

export const useUpdateApiKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => mockApi.updateApiKey(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'api_keys'] });
    },
  });
};

export const useDeleteApiKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, totp_code }: { id: string; totp_code?: string }) => mockApi.deleteApiKey(id, totp_code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'api_keys'] });
    },
  });
};

export const useLabels = () => {
  return useQuery({
    queryKey: ['user', 'labels'],
    queryFn: mockApi.getLabels,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDocuments = () => {
  return useQuery({
    queryKey: ['user', 'documents'],
    queryFn: mockApi.getDocuments,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockApi.uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'documents'] });
    },
  });
};

export const usePhones = () => {
  return useQuery({
    queryKey: ['user', 'phones'],
    queryFn: mockApi.getPhones,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreatePhone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockApi.createPhone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'phones'] });
    },
  });
};

export const useGenerateOtpQrCode = () => {
  return useQuery({
    queryKey: ['user', 'otp', 'qr'],
    queryFn: mockApi.generateOtpQrCode,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useEnableOtp = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockApi.enableOtp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: mockApi.changePassword,
  });
};

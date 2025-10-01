import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { env } from '../../env';

// User Resource API endpoints - Orbisigner
const USER_ENDPOINTS = {
  // User profile
  profile: '/api/v2/resource/users/me',
  updateProfile: '/api/v2/resource/users/me',
  
  // Documents
  documents: '/api/v2/resource/documents',
  document: '/api/v2/resource/documents/:id',
  
  // Phones
  phones: '/api/v2/resource/phones',
  phone: '/api/v2/resource/phones/:id',
  
  // OTP/2FA
  otpEnable: '/api/v2/resource/otp/enable',
  otpDisable: '/api/v2/resource/otp/disable',
  otpVerify: '/api/v2/resource/otp/verify',
  
  // API Keys
  apiKeys: '/api/v2/resource/api_keys',
  apiKey: '/api/v2/resource/api_keys/:id',
  
  // Labels
  labels: '/api/v2/resource/labels',
  label: '/api/v2/resource/labels/:id',
  
  // Data Storage
  dataStorage: '/api/v2/resource/data_storage',
} as const;

// Types for user resource API responses
export interface UserProfile {
  uid: string;
  email: string;
  username: string | null;
  role: string;
  level: number;
  state: string;
  otp: boolean;
  referral_uid: string | null;
  data: any;
  csrf_token: string;
  labels: string[];
  phones: Phone[];
  profiles: Profile[];
  data_storages: DataStorage[];
  created_at: string;
  updated_at: string;
}

export interface Profile {
  first_name: string | null;
  last_name: string | null;
  dob: string | null;
  address: string | null;
  postcode: string | null;
  city: string | null;
  country: string | null;
  state: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface Phone {
  id: number;
  number: string;
  country: string;
  validated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  doc_type: string;
  doc_number: string;
  doc_expire: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: number;
  kid: string;
  algorithm: string;
  scope: string[];
  state: string;
  created_at: string;
  updated_at: string;
}

export interface Label {
  id: number;
  key: string;
  value: string;
  scope: string;
  created_at: string;
  updated_at: string;
}

export interface DataStorage {
  id: number;
  key: string;
  value: any;
  created_at: string;
  updated_at: string;
}

export interface OtpSecret {
  secret: string;
  qr_code: string;
}

// Create a direct fetch client for Orbisigner User Resource API
const orbisignerUserClient = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${env.NEXT_PUBLIC_AUTH_SERVICE_URL.replace('/api/v2/identity', '')}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Orbisigner User API request failed:', error);
      throw error;
    }
  }
};

// User Resource API functions
const userApi = {
  // Profile
  getProfile: async (): Promise<UserProfile> => {
    return orbisignerUserClient.request<UserProfile>(USER_ENDPOINTS.profile, {
      method: 'GET',
    });
  },

  updateProfile: async (data: Partial<Profile>): Promise<UserProfile> => {
    return orbisignerUserClient.request<UserProfile>(USER_ENDPOINTS.updateProfile, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Documents
  getDocuments: async (): Promise<Document[]> => {
    return orbisignerUserClient.request<Document[]>(USER_ENDPOINTS.documents, {
      method: 'GET',
    });
  },

  createDocument: async (data: {
    doc_type: string;
    doc_number: string;
    doc_expire?: string;
    metadata?: any;
  }): Promise<Document> => {
    return orbisignerUserClient.request<Document>(USER_ENDPOINTS.documents, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateDocument: async (id: number, data: Partial<Document>): Promise<Document> => {
    const url = USER_ENDPOINTS.document.replace(':id', id.toString());
    return orbisignerUserClient.request<Document>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteDocument: async (id: number): Promise<{ message: string }> => {
    const url = USER_ENDPOINTS.document.replace(':id', id.toString());
    return orbisignerUserClient.request<{ message: string }>(url, {
      method: 'DELETE',
    });
  },

  // Phones
  getPhones: async (): Promise<Phone[]> => {
    return orbisignerUserClient.request<Phone[]>(USER_ENDPOINTS.phones, {
      method: 'GET',
    });
  },

  createPhone: async (data: {
    number: string;
    country: string;
  }): Promise<Phone> => {
    return orbisignerUserClient.request<Phone>(USER_ENDPOINTS.phones, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  verifyPhone: async (id: number, code: string): Promise<Phone> => {
    const url = USER_ENDPOINTS.phone.replace(':id', id.toString());
    return orbisignerUserClient.request<Phone>(url, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  deletePhone: async (id: number): Promise<{ message: string }> => {
    const url = USER_ENDPOINTS.phone.replace(':id', id.toString());
    return orbisignerUserClient.request<{ message: string }>(url, {
      method: 'DELETE',
    });
  },

  // OTP/2FA
  enableOtp: async (): Promise<OtpSecret> => {
    return orbisignerUserClient.request<OtpSecret>(USER_ENDPOINTS.otpEnable, {
      method: 'POST',
    });
  },

  disableOtp: async (code: string): Promise<{ message: string }> => {
    return orbisignerUserClient.request<{ message: string }>(USER_ENDPOINTS.otpDisable, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  verifyOtp: async (code: string): Promise<{ message: string }> => {
    return orbisignerUserClient.request<{ message: string }>(USER_ENDPOINTS.otpVerify, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  // API Keys
  getApiKeys: async (): Promise<ApiKey[]> => {
    return orbisignerUserClient.request<ApiKey[]>(USER_ENDPOINTS.apiKeys, {
      method: 'GET',
    });
  },

  createApiKey: async (data: {
    algorithm: string;
    scope: string[];
  }): Promise<ApiKey> => {
    return orbisignerUserClient.request<ApiKey>(USER_ENDPOINTS.apiKeys, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateApiKey: async (id: number, data: {
    state: string;
  }): Promise<ApiKey> => {
    const url = USER_ENDPOINTS.apiKey.replace(':id', id.toString());
    return orbisignerUserClient.request<ApiKey>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteApiKey: async (id: number): Promise<{ message: string }> => {
    const url = USER_ENDPOINTS.apiKey.replace(':id', id.toString());
    return orbisignerUserClient.request<{ message: string }>(url, {
      method: 'DELETE',
    });
  },

  // Labels
  getLabels: async (): Promise<Label[]> => {
    return orbisignerUserClient.request<Label[]>(USER_ENDPOINTS.labels, {
      method: 'GET',
    });
  },

  createLabel: async (data: {
    key: string;
    value: string;
    scope: string;
  }): Promise<Label> => {
    return orbisignerUserClient.request<Label>(USER_ENDPOINTS.labels, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateLabel: async (id: number, data: Partial<Label>): Promise<Label> => {
    const url = USER_ENDPOINTS.label.replace(':id', id.toString());
    return orbisignerUserClient.request<Label>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteLabel: async (id: number): Promise<{ message: string }> => {
    const url = USER_ENDPOINTS.label.replace(':id', id.toString());
    return orbisignerUserClient.request<{ message: string }>(url, {
      method: 'DELETE',
    });
  },

  // Data Storage
  getDataStorage: async (): Promise<DataStorage[]> => {
    return orbisignerUserClient.request<DataStorage[]>(USER_ENDPOINTS.dataStorage, {
      method: 'GET',
    });
  },

  setDataStorage: async (data: {
    key: string;
    value: any;
  }): Promise<DataStorage> => {
    return orbisignerUserClient.request<DataStorage>(USER_ENDPOINTS.dataStorage, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// React Query hooks
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: userApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};

export const useUserDocuments = () => {
  return useQuery({
    queryKey: ['user', 'documents'],
    queryFn: userApi.getDocuments,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.createDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'documents'] });
    },
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Document> }) => 
      userApi.updateDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'documents'] });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'documents'] });
    },
  });
};

export const useUserPhones = () => {
  return useQuery({
    queryKey: ['user', 'phones'],
    queryFn: userApi.getPhones,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreatePhone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.createPhone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'phones'] });
    },
  });
};

export const useVerifyPhone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, code }: { id: number; code: string }) => 
      userApi.verifyPhone(id, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'phones'] });
    },
  });
};

export const useDeletePhone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.deletePhone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'phones'] });
    },
  });
};

export const useEnableOtp = () => {
  return useMutation({
    mutationFn: userApi.enableOtp,
  });
};

export const useDisableOtp = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.disableOtp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: userApi.verifyOtp,
  });
};

export const useUserApiKeys = () => {
  return useQuery({
    queryKey: ['user', 'api_keys'],
    queryFn: userApi.getApiKeys,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateApiKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.createApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'api_keys'] });
    },
  });
};

export const useUpdateApiKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { state: string } }) => 
      userApi.updateApiKey(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'api_keys'] });
    },
  });
};

export const useDeleteApiKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.deleteApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'api_keys'] });
    },
  });
};

export const useUserLabels = () => {
  return useQuery({
    queryKey: ['user', 'labels'],
    queryFn: userApi.getLabels,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateLabel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.createLabel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'labels'] });
    },
  });
};

export const useUpdateLabel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Label> }) => 
      userApi.updateLabel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'labels'] });
    },
  });
};

export const useDeleteLabel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.deleteLabel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'labels'] });
    },
  });
};

export const useUserDataStorage = () => {
  return useQuery({
    queryKey: ['user', 'data_storage'],
    queryFn: userApi.getDataStorage,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSetDataStorage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.setDataStorage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'data_storage'] });
    },
  });
};

// Export the API functions for direct use
export { userApi };
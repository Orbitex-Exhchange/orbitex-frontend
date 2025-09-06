import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { User, mockUsers } from '../mock-data';

// User API endpoints
const USER_ENDPOINTS = {
  profile: '/api/v2/barong/resource/users/me',
  update: '/api/v2/barong/resource/users',
  documents: '/api/v2/barong/resource/documents',
  phones: '/api/v2/barong/resource/phones',
  labels: '/api/v2/barong/resource/labels',
} as const;

// Mock API functions
const mockApi = {
  getProfile: async (): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = mockUsers[0];
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },
  
  updateProfile: async (data: Partial<User>): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const currentUser = mockUsers[0];
    if (!currentUser) {
      throw new Error('User not found');
    }
    return { ...currentUser, ...data };
  },
  
  uploadDocument: async (file: File, label: string): Promise<{ upload: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { upload: `https://example.com/uploads/${file.name}` };
  },
  
  addPhone: async (phone: string): Promise<{ phone: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { phone };
  },
  
  addLabel: async (label: string): Promise<{ label: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { label };
  },
};

// React Query hooks
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: mockApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockApi.updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user', 'profile'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, label }: { file: File; label: string }) => 
      mockApi.uploadDocument(file, label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};

export const useAddPhone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockApi.addPhone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};

export const useAddLabel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockApi.addLabel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};

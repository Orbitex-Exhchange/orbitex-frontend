import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../client';
import { Lead, mockLeads } from '../mock-data/enhanced';

// Leads API endpoints
const LEADS_ENDPOINTS = {
  create: '/api/api_v2/leads',
} as const;

// Mock API functions
const mockApi = {
  createLead: async (data: {
    email: string;
    data?: Record<string, any>;
  }): Promise<Lead> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newLead: Lead = {
      id: Date.now().toString(),
      email: data.email,
      state: 'pending',
      data: data.data || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return newLead;
  },
};

// React Query hooks
export const useCreateLead = () => {
  return useMutation({
    mutationFn: mockApi.createLead,
  });
};

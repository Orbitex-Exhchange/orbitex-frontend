import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { Wallet, mockWallets } from '../mock-data';

// Wallets API endpoints
const WALLETS_ENDPOINTS = {
  list: '/api/v2/peatio/account/balances',
  deposit: '/api/v2/peatio/account/deposits',
  withdraw: '/api/v2/peatio/account/withdraws',
  depositAddress: '/api/v2/peatio/account/deposit_address/:currency',
} as const;

// Mock API functions
const mockApi = {
  getWallets: async (): Promise<Wallet[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockWallets;
  },
  
  getWallet: async (currency: string): Promise<Wallet | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockWallets.find(w => w.currency === currency) || null;
  },
  
  createDeposit: async (currency: string, amount: string): Promise<{ id: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { id: `deposit-${Date.now()}` };
  },
  
  createWithdraw: async (currency: string, amount: string, address: string): Promise<{ id: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { id: `withdraw-${Date.now()}` };
  },
  
  getDepositAddress: async (currency: string): Promise<{ address: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const wallet = mockWallets.find(w => w.currency === currency);
    return { address: wallet?.deposit_address || `address-${currency}-${Date.now()}` };
  },
};

// React Query hooks
export const useWallets = () => {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: mockApi.getWallets,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useWallet = (currency: string) => {
  return useQuery({
    queryKey: ['wallets', currency],
    queryFn: () => mockApi.getWallet(currency),
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!currency,
  });
};

export const useCreateDeposit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ currency, amount }: { currency: string; amount: string }) =>
      mockApi.createDeposit(currency, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
};

export const useCreateWithdraw = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ currency, amount, address }: { currency: string; amount: string; address: string }) =>
      mockApi.createWithdraw(currency, amount, address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
};

export const useDepositAddress = (currency: string) => {
  return useQuery({
    queryKey: ['wallets', currency, 'deposit-address'],
    queryFn: () => mockApi.getDepositAddress(currency),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!currency,
  });
};

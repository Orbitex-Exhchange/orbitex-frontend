import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { V2Account, ApiResponse } from '../types/api_v2';

// Wallet interface based on the V2 API response
export interface Wallet {
  currency: string;
  balance: string;
  locked: string;
  deposit_address?: string;
  updated_at: string;
}

// Wallets API endpoints - Updated to match V2 API structure
const WALLETS_ENDPOINTS = {
  list: '/api/api_v2/account/balances',
  balance: '/api/api_v2/account/balances/:currency',
  depositAddress: '/api/api_v2/account/deposit_address/:currency',
} as const;

// Real V2 API functions - Standalone (No ObjectWrapper to avoid TDZ)
export const getWallets = async (): Promise<Wallet[]> => {
  const response = await apiClient.get<ApiResponse<V2Account[]>>(WALLETS_ENDPOINTS.list);
  return response.data.data.map(account => ({
    currency: account.currency,
    balance: account.balance,
    locked: account.locked,
    updated_at: account.updated_at,
  }));
};

export const getWallet = async (currency: string): Promise<Wallet | null> => {
  try {
    const url = WALLETS_ENDPOINTS.balance.replace(':currency', currency);
    const response = await apiClient.get<{ data: V2Account }>(url);
    const account = response.data.data;
    return {
      currency: account.currency,
      balance: account.balance,
      locked: account.locked,
      updated_at: account.updated_at,
    };
  } catch (error) {
    return null;
  }
};

export const getDepositAddress = async (currency: string): Promise<{ currency: string; address: string; state: string }> => {
  const url = WALLETS_ENDPOINTS.depositAddress.replace(':currency', currency);
  const response = await apiClient.post<{ data: { currency: string; address: string; state: string } }>(url);
  return response.data.data;
};

// React Query hooks
export const useWallets = () => {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: getWallets,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useWallet = (currency: string) => {
  return useQuery({
    queryKey: ['wallets', currency],
    queryFn: () => getWallet(currency),
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!currency,
  });
};

export const useDepositAddress = (currency: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => getDepositAddress(currency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
};

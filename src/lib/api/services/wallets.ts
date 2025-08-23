import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api-client';

// Wallet interface based on the real backend response
export interface Wallet {
  currency: string;
  balance: string;
  locked: string;
  deposit_address?: string;
  updated_at: string;
}

// Wallets API endpoints
const WALLETS_ENDPOINTS = {
  list: '/api/v2/peatio/account/balances',
  deposit: '/api/v2/peatio/account/deposits',
  withdraw: '/api/v2/peatio/account/withdraws',
  depositAddress: '/api/v2/peatio/account/deposit_address/:currency',
} as const;

// Real API functions - Connected to our backend
const realApi = {
  getWallets: async (authToken: string): Promise<Wallet[]> => {
    const response = await api.get(WALLETS_ENDPOINTS.list, { authToken });
    return response;
  },
  
  getWallet: async (currency: string, authToken: string): Promise<Wallet | null> => {
    const response = await api.get(WALLETS_ENDPOINTS.list, { authToken });
    const wallets = response;
    return wallets.find((w: Wallet) => w.currency === currency) || null;
  },
  
  createDeposit: async (currency: string, amount: string, authToken: string): Promise<{ id: string }> => {
    const response = await api.post(WALLETS_ENDPOINTS.deposit, {
      currency,
      amount,
    }, { authToken });
    return response;
  },
  
  createWithdraw: async (currency: string, amount: string, address: string, authToken: string): Promise<{ id: string }> => {
    const response = await api.post(WALLETS_ENDPOINTS.withdraw, {
      currency,
      amount,
      address,
    }, { authToken });
    return response;
  },
  
  getDepositAddress: async (currency: string, authToken: string): Promise<{ address: string }> => {
    const url = WALLETS_ENDPOINTS.depositAddress.replace(':currency', currency);
    const response = await api.get(url, { authToken });
    return response;
  },
};

// React Query hooks
export const useWallets = (authToken?: string) => {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: () => realApi.getWallets(authToken || ''),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    enabled: !!authToken,
  });
};

export const useWallet = (currency: string, authToken?: string) => {
  return useQuery({
    queryKey: ['wallets', currency],
    queryFn: () => realApi.getWallet(currency, authToken || ''),
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!currency && !!authToken,
  });
};

export const useCreateDeposit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ currency, amount, authToken }: { currency: string; amount: string; authToken: string }) =>
      realApi.createDeposit(currency, amount, authToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
};

export const useCreateWithdraw = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ currency, amount, address, authToken }: { currency: string; amount: string; address: string; authToken: string }) =>
      realApi.createWithdraw(currency, amount, address, authToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
};

export const useDepositAddress = (currency: string, authToken?: string) => {
  return useQuery({
    queryKey: ['wallets', currency, 'deposit-address'],
    queryFn: () => realApi.getDepositAddress(currency, authToken || ''),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!currency && !!authToken,
  });
};

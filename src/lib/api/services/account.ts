import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import {
  V2Account,
  V2Deposit,
  V2Withdraw,
  V2Transaction,
  V2Beneficiary,
  V2InternalTransfer,
  V2Stats
} from '../types/api_v2';

// Account API endpoints - Updated to match V2 API structure
const ACCOUNT_ENDPOINTS = {
  balances: '/api/api_v2/account/balances',
  balance: '/api/api_v2/account/balances/:currency',
  deposits: '/api/api_v2/account/deposits',
  deposit: '/api/api_v2/account/deposits/:txid',
  depositAddress: '/api/api_v2/account/deposit_address/:currency',
  withdraws: '/api/api_v2/account/withdraws',
  withdraw: '/api/api_v2/account/withdraws/:txid',
  transactions: '/api/api_v2/account/transactions',
  transaction: '/api/api_v2/account/transactions/:txid',
  beneficiaries: '/api/api_v2/account/beneficiaries',
  beneficiary: '/api/api_v2/account/beneficiaries/:id',
  internalTransfers: '/api/api_v2/account/internal_transfers',
  internalTransfer: '/api/api_v2/account/internal_transfers/:id',
  stats: '/api/api_v2/account/stats',
} as const;

// Real V2 API functions - Standalone (No ObjectWrapper to avoid TDZ)
const unwrapData = <T>(payload: T | { data?: T }): T =>
  ((payload as { data?: T })?.data ?? payload) as T;

export const getBalances = async (): Promise<V2Account[]> => {
  const response = await apiClient.get<V2Account[]>(ACCOUNT_ENDPOINTS.balances);
  return unwrapData(response.data) || [];
};

export const getBalance = async (currency: string): Promise<V2Account | null> => {
  try {
    const url = ACCOUNT_ENDPOINTS.balance.replace(':currency', currency);
    const response = await apiClient.get<{ data: V2Account }>(url);
    return unwrapData(response.data);
  } catch (error) {
    return null;
  }
};

export const getDeposits = async (params?: {
  currency?: string;
  state?: string;
  limit?: number;
  page?: number;
}): Promise<V2Deposit[]> => {
  const response = await apiClient.get<V2Deposit[]>(ACCOUNT_ENDPOINTS.deposits, {
    params
  });
  return unwrapData(response.data) || [];
};

export const getDeposit = async (txid: string): Promise<V2Deposit | null> => {
  try {
    const url = ACCOUNT_ENDPOINTS.deposit.replace(':txid', txid);
    const response = await apiClient.get<{ data: V2Deposit }>(url);
    return unwrapData(response.data);
  } catch (error) {
    return null;
  }
};

export const createDepositAddress = async (currency: string): Promise<{
  currency: string;
  address: string;
  state: string;
}> => {
  const url = ACCOUNT_ENDPOINTS.depositAddress.replace(':currency', currency);
  const response = await apiClient.post<{ data: { currency: string; address: string; state: string } }>(url);
  return unwrapData(response.data);
};

export const getWithdraws = async (params?: {
  currency?: string;
  state?: string;
  limit?: number;
  page?: number;
}): Promise<V2Withdraw[]> => {
  const response = await apiClient.get<V2Withdraw[]>(ACCOUNT_ENDPOINTS.withdraws, {
    params
  });
  return unwrapData(response.data) || [];
};

export const getWithdraw = async (txid: string): Promise<V2Withdraw | null> => {
  try {
    const url = ACCOUNT_ENDPOINTS.withdraw.replace(':txid', txid);
    const response = await apiClient.get<{ data: V2Withdraw }>(url);
    return unwrapData(response.data);
  } catch (error) {
    return null;
  }
};

export const createWithdraw = async (data: {
  currency: string;
  amount: string;
  rid: string;
  otp?: string;
}): Promise<{
  id: string;
  currency: string;
  amount: string;
  fee: string;
  rid: string;
  state: string;
  created_at: number;
}> => {
  const response = await apiClient.post<{
    data: {
      id: string;
      currency: string;
      amount: string;
      fee: string;
      rid: string;
      state: string;
      created_at: number;
    }
  }>(ACCOUNT_ENDPOINTS.withdraws, data);
  return unwrapData(response.data);
};

export const getTransactions = async (params?: {
  currency?: string;
  state?: string;
  limit?: number;
  page?: number;
}): Promise<V2Transaction[]> => {
  const response = await apiClient.get<V2Transaction[]>(ACCOUNT_ENDPOINTS.transactions, {
    params
  });
  return unwrapData(response.data) || [];
};

export const getTransaction = async (txid: string): Promise<V2Transaction | null> => {
  try {
    const url = ACCOUNT_ENDPOINTS.transaction.replace(':txid', txid);
    const response = await apiClient.get<{ data: V2Transaction }>(url);
    return unwrapData(response.data);
  } catch (error) {
    return null;
  }
};

export const getBeneficiaries = async (): Promise<V2Beneficiary[]> => {
  const response = await apiClient.get<V2Beneficiary[]>(ACCOUNT_ENDPOINTS.beneficiaries);
  return unwrapData(response.data) || [];
};

export const getBeneficiary = async (id: number): Promise<V2Beneficiary | null> => {
  try {
    const url = ACCOUNT_ENDPOINTS.beneficiary.replace(':id', id.toString());
    const response = await apiClient.get<{ data: V2Beneficiary }>(url);
    return unwrapData(response.data);
  } catch (error) {
    return null;
  }
};

export const createBeneficiary = async (data: {
  currency: string;
  name: string;
  data: any;
}): Promise<V2Beneficiary> => {
  const response = await apiClient.post<{ data: V2Beneficiary }>(ACCOUNT_ENDPOINTS.beneficiaries, data);
  return unwrapData(response.data);
};

export const deleteBeneficiary = async (id: number): Promise<{ message: string }> => {
  const url = ACCOUNT_ENDPOINTS.beneficiary.replace(':id', id.toString());
  const response = await apiClient.delete<{ message: string }>(url);
  return response.data;
};

export const getInternalTransfers = async (params?: {
  currency?: string;
  state?: string;
  limit?: number;
  page?: number;
}): Promise<V2InternalTransfer[]> => {
  const response = await apiClient.get<V2InternalTransfer[]>(ACCOUNT_ENDPOINTS.internalTransfers, {
    params
  });
  return unwrapData(response.data) || [];
};

export const getInternalTransfer = async (id: number): Promise<V2InternalTransfer | null> => {
  try {
    const url = ACCOUNT_ENDPOINTS.internalTransfer.replace(':id', id.toString());
    const response = await apiClient.get<{ data: V2InternalTransfer }>(url);
    return unwrapData(response.data);
  } catch (error) {
    return null;
  }
};

export const createInternalTransfer = async (data: {
  currency: string;
  amount: string;
  username: string;
  otp?: string;
}): Promise<{
  id: string;
  currency: string;
  amount: string;
  state: string;
  created_at: number;
}> => {
  const response = await apiClient.post<{
    data: {
      id: string;
      currency: string;
      amount: string;
      state: string;
      created_at: number;
    }
  }>(ACCOUNT_ENDPOINTS.internalTransfers, data);
  return unwrapData(response.data);
};

export const getStats = async (): Promise<V2Stats> => {
  const response = await apiClient.get<{ data: V2Stats }>(ACCOUNT_ENDPOINTS.stats);
  return unwrapData(response.data);
};

// React Query hooks
export const useAccountBalances = () => {
  // Check if authenticated
  const isAuthenticated = typeof window !== 'undefined' ? !!localStorage.getItem('access_token') : false;

  return useQuery({
    queryKey: ['account', 'balances'],
    queryFn: getBalances,
    enabled: isAuthenticated, // Only run if authenticated
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: isAuthenticated ? 30 * 1000 : false, // Refetch every 30 seconds if authenticated
    retry: (failureCount, error: any) => {
      // Don't retry on 403 permission errors
      if (error?.status === 403 || error?.code === 'user.ability.not_permitted') {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useAccountBalance = (currency: string) => {
  return useQuery({
    queryKey: ['account', 'balance', currency],
    queryFn: () => getBalance(currency),
    enabled: !!currency,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useAccountDeposits = (params?: {
  currency?: string;
  state?: string;
  limit?: number;
  page?: number;
}) => {
  return useQuery({
    queryKey: ['account', 'deposits', params],
    queryFn: () => getDeposits(params),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useAccountDeposit = (txid: string) => {
  return useQuery({
    queryKey: ['account', 'deposit', txid],
    queryFn: () => getDeposit(txid),
    enabled: !!txid,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useCreateDepositAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDepositAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'balances'] });
    },
  });
};

export const useAccountWithdraws = (params?: {
  currency?: string;
  state?: string;
  limit?: number;
  page?: number;
}) => {
  return useQuery({
    queryKey: ['account', 'withdraws', params],
    queryFn: () => getWithdraws(params),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useAccountWithdraw = (txid: string) => {
  return useQuery({
    queryKey: ['account', 'withdraw', txid],
    queryFn: () => getWithdraw(txid),
    enabled: !!txid,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useCreateWithdraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWithdraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'withdraws'] });
      queryClient.invalidateQueries({ queryKey: ['account', 'balances'] });
    },
  });
};

export const useAccountTransactions = (params?: {
  currency?: string;
  state?: string;
  limit?: number;
  page?: number;
}) => {
  return useQuery({
    queryKey: ['account', 'transactions', params],
    queryFn: () => getTransactions(params),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useAccountTransaction = (txid: string) => {
  return useQuery({
    queryKey: ['account', 'transaction', txid],
    queryFn: () => getTransaction(txid),
    enabled: !!txid,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useBeneficiaries = () => {
  return useQuery({
    queryKey: ['account', 'beneficiaries'],
    queryFn: getBeneficiaries,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBeneficiary = (id: number) => {
  return useQuery({
    queryKey: ['account', 'beneficiary', id],
    queryFn: () => getBeneficiary(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateBeneficiary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBeneficiary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'beneficiaries'] });
    },
  });
};

export const useDeleteBeneficiary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBeneficiary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'beneficiaries'] });
    },
  });
};

export const useInternalTransfers = (params?: {
  currency?: string;
  state?: string;
  limit?: number;
  page?: number;
}) => {
  return useQuery({
    queryKey: ['account', 'internal_transfers', params],
    queryFn: () => getInternalTransfers(params),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useInternalTransfer = (id: number) => {
  return useQuery({
    queryKey: ['account', 'internal_transfer', id],
    queryFn: () => getInternalTransfer(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useCreateInternalTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInternalTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'internal_transfers'] });
      queryClient.invalidateQueries({ queryKey: ['account', 'balances'] });
    },
  });
};

export const useAccountStats = () => {
  const isAuthenticated = typeof window !== 'undefined' ? !!localStorage.getItem('access_token') : false;

  return useQuery({
    queryKey: ['account', 'stats'],
    queryFn: getStats,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403 || error?.code === 'user.ability.not_permitted') {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Alias for backward compatibility
export const useWallets = useAccountBalances;

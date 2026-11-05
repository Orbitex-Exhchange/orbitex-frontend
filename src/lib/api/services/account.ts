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
import {
  BACKEND_RUST_ENDPOINTS,
  normalizeBackendArray,
  unwrapBackendData,
} from '../backend-rust';

// Account API endpoints - Updated to match V2 API structure
const ACCOUNT_ENDPOINTS = {
  balances: BACKEND_RUST_ENDPOINTS.account.balances,
  balance: '/api/v2/account/balances/:currency',
  deposits: BACKEND_RUST_ENDPOINTS.account.deposits,
  deposit: '/api/v2/account/deposits/:txid',
  depositAddress: '/api/v2/account/deposit_address/:currency',
  withdraws: BACKEND_RUST_ENDPOINTS.account.withdraws,
  withdraw: '/api/v2/account/withdraws/:txid',
  transactions: BACKEND_RUST_ENDPOINTS.account.transactions,
  transaction: '/api/v2/account/transactions/:txid',
  beneficiaries: BACKEND_RUST_ENDPOINTS.account.beneficiaries,
  beneficiary: '/api/v2/account/beneficiaries/:id',
  internalTransfers: BACKEND_RUST_ENDPOINTS.account.internalTransfers,
  internalTransfer: '/api/v2/account/internal-transfers/:id',
  stats: BACKEND_RUST_ENDPOINTS.account.stats,
} as const;

const hasAccessToken = (): boolean =>
  typeof window !== 'undefined' && Boolean(localStorage.getItem('access_token'));

export const getBalances = async (): Promise<V2Account[]> => {
  const response = await apiClient.get<V2Account[]>(ACCOUNT_ENDPOINTS.balances, {
    retry: false,
    timeout: 10000,
  });
  return normalizeBackendArray<V2Account>(response.data, 'balances');
};

export const getBalance = async (currency: string): Promise<V2Account | null> => {
  try {
    const url = ACCOUNT_ENDPOINTS.balance.replace(':currency', currency);
    const response = await apiClient.get<{ data: V2Account }>(url);
    return unwrapBackendData(response.data);
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
  return normalizeBackendArray<V2Deposit>(response.data, 'deposits');
};

export const getDeposit = async (txid: string): Promise<V2Deposit | null> => {
  try {
    const url = ACCOUNT_ENDPOINTS.deposit.replace(':txid', txid);
    const response = await apiClient.get<{ data: V2Deposit }>(url);
    return unwrapBackendData(response.data);
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
  return unwrapBackendData(response.data);
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
  return normalizeBackendArray<V2Withdraw>(response.data, 'withdraws');
};

export const getWithdraw = async (txid: string): Promise<V2Withdraw | null> => {
  try {
    const url = ACCOUNT_ENDPOINTS.withdraw.replace(':txid', txid);
    const response = await apiClient.get<{ data: V2Withdraw }>(url);
    return unwrapBackendData(response.data);
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
  return unwrapBackendData(response.data);
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
  return normalizeBackendArray<V2Transaction>(response.data, 'transactions');
};

export const getTransaction = async (txid: string): Promise<V2Transaction | null> => {
  try {
    const url = ACCOUNT_ENDPOINTS.transaction.replace(':txid', txid);
    const response = await apiClient.get<{ data: V2Transaction }>(url);
    return unwrapBackendData(response.data);
  } catch (error) {
    return null;
  }
};

export const getBeneficiaries = async (): Promise<V2Beneficiary[]> => {
  const response = await apiClient.get<V2Beneficiary[]>(ACCOUNT_ENDPOINTS.beneficiaries);
  return normalizeBackendArray<V2Beneficiary>(response.data, 'beneficiaries');
};

export const getBeneficiary = async (id: number): Promise<V2Beneficiary | null> => {
  try {
    const url = ACCOUNT_ENDPOINTS.beneficiary.replace(':id', id.toString());
    const response = await apiClient.get<{ data: V2Beneficiary }>(url);
    return unwrapBackendData(response.data);
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
  return unwrapBackendData(response.data);
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
  return normalizeBackendArray<V2InternalTransfer>(response.data, 'internal_transfers');
};

export const getInternalTransfer = async (id: number): Promise<V2InternalTransfer | null> => {
  try {
    const url = ACCOUNT_ENDPOINTS.internalTransfer.replace(':id', id.toString());
    const response = await apiClient.get<{ data: V2InternalTransfer }>(url);
    return unwrapBackendData(response.data);
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
  return unwrapBackendData(response.data);
};

export const getStats = async (): Promise<V2Stats> => {
  const response = await apiClient.get<{ data: V2Stats }>(ACCOUNT_ENDPOINTS.stats, {
    retry: false,
    timeout: 10000,
  });
  return unwrapBackendData(response.data);
};

// React Query hooks
export const useAccountBalances = () => {
  const isAuthenticated = hasAccessToken();

  return useQuery({
    queryKey: ['account', 'balances'],
    queryFn: getBalances,
    enabled: isAuthenticated, // Only run if authenticated
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: isAuthenticated ? 30 * 1000 : false, // Refetch every 30 seconds if authenticated
    retry: false,
  });
};

export const useAccountBalance = (currency: string) => {
  return useQuery({
    queryKey: ['account', 'balance', currency],
    queryFn: () => getBalance(currency),
    enabled: !!currency && hasAccessToken(),
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
    enabled: hasAccessToken(),
    staleTime: 60 * 1000, // 1 minute,
    retry: false
  });
};

export const useAccountDeposit = (txid: string) => {
  return useQuery({
    queryKey: ['account', 'deposit', txid],
    queryFn: () => getDeposit(txid),
    enabled: !!txid && hasAccessToken(),
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
    enabled: hasAccessToken(),
    staleTime: 60 * 1000, // 1 minute,
    retry: false
  });
};

export const useAccountWithdraw = (txid: string) => {
  return useQuery({
    queryKey: ['account', 'withdraw', txid],
    queryFn: () => getWithdraw(txid),
    enabled: !!txid && hasAccessToken(),
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
    enabled: hasAccessToken(),
    staleTime: 60 * 1000, // 1 minute,
    retry: false
  });
};

export const useAccountTransaction = (txid: string) => {
  return useQuery({
    queryKey: ['account', 'transaction', txid],
    queryFn: () => getTransaction(txid),
    enabled: !!txid && hasAccessToken(),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useBeneficiaries = () => {
  return useQuery({
    queryKey: ['account', 'beneficiaries'],
    queryFn: getBeneficiaries,
    enabled: hasAccessToken(),
    staleTime: 5 * 60 * 1000, // 5 minutes,
    retry: false
  });
};

export const useBeneficiary = (id: number) => {
  return useQuery({
    queryKey: ['account', 'beneficiary', id],
    queryFn: () => getBeneficiary(id),
    enabled: !!id && hasAccessToken(),
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
    queryKey: ['account', 'internal-transfers', params],
    queryFn: () => getInternalTransfers(params),
    enabled: hasAccessToken(),
    staleTime: 60 * 1000, // 1 minute,
    retry: false
  });
};

export const useInternalTransfer = (id: number) => {
  return useQuery({
    queryKey: ['account', 'internal_transfer', id],
    queryFn: () => getInternalTransfer(id),
    enabled: !!id && hasAccessToken(),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useCreateInternalTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInternalTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'internal-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['account', 'balances'] });
    },
  });
};

export const useAccountStats = () => {
  const isAuthenticated = hasAccessToken();

  return useQuery({
    queryKey: ['account', 'stats'],
    queryFn: getStats,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};

// Alias for backward compatibility
export const useWallets = useAccountBalances;

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { 
  AccountBalance, 
  AccountDeposit, 
  AccountWithdraw, 
  Beneficiary,
  mockAccountBalances,
  mockDeposits,
  mockWithdrawals,
  mockBeneficiaries
} from '../mock-data/enhanced';

// Account API endpoints
const ACCOUNT_ENDPOINTS = {
  balances: '/api/v2/peatio/account/balances',
  deposits: '/api/v2/peatio/account/deposits',
  withdrawals: '/api/v2/peatio/account/withdraws',
  beneficiaries: '/api/v2/peatio/account/beneficiaries',
  depositAddress: '/api/v2/peatio/account/deposit_address',
  history: '/api/v2/peatio/account/history',
} as const;

// Mock API functions
const mockApi = {
  getBalances: async (): Promise<AccountBalance[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAccountBalances;
  },

  getBalance: async (currency: string): Promise<AccountBalance | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockAccountBalances.find(b => b.currency === currency) || null;
  },

  getDeposits: async (params?: {
    currency?: string;
    limit?: number;
    page?: number;
  }): Promise<AccountDeposit[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    let deposits = mockDeposits;
    
    if (params?.currency) {
      deposits = deposits.filter(d => d.currency === params.currency);
    }
    
    return deposits;
  },

  getDeposit: async (id: string): Promise<AccountDeposit | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDeposits.find(d => d.id === id) || null;
  },

  createDeposit: async (data: {
    currency: string;
    amount: string;
  }): Promise<AccountDeposit> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newDeposit: AccountDeposit = {
      id: Date.now().toString(),
      currency: data.currency,
      amount: data.amount,
      fee: "0",
      txid: `tx_${Date.now()}`,
      state: 'submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return newDeposit;
  },

  getWithdrawals: async (params?: {
    currency?: string;
    limit?: number;
    page?: number;
  }): Promise<AccountWithdraw[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    let withdrawals = mockWithdrawals;
    
    if (params?.currency) {
      withdrawals = withdrawals.filter(w => w.currency === params.currency);
    }
    
    return withdrawals;
  },

  getWithdrawal: async (id: string): Promise<AccountWithdraw | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockWithdrawals.find(w => w.id === id) || null;
  },

  createWithdrawal: async (data: {
    currency: string;
    amount: string;
    beneficiary_id: string;
    otp_code?: string;
  }): Promise<AccountWithdraw> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newWithdrawal: AccountWithdraw = {
      id: Date.now().toString(),
      currency: data.currency,
      amount: data.amount,
      fee: "1",
      txid: `tx_${Date.now()}`,
      state: 'submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return newWithdrawal;
  },

  getBeneficiaries: async (): Promise<Beneficiary[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockBeneficiaries;
  },

  getBeneficiary: async (id: string): Promise<Beneficiary | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockBeneficiaries.find(b => b.id === id) || null;
  },

  createBeneficiary: async (data: {
    currency: string;
    name: string;
    description?: string;
    data: {
      address?: string;
      account_number?: string;
      bank_name?: string;
      bank_swift_code?: string;
      intermediary_bank_name?: string;
      intermediary_bank_swift_code?: string;
    };
  }): Promise<Beneficiary> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newBeneficiary: Beneficiary = {
      id: Date.now().toString(),
      currency: data.currency,
      name: data.name,
      description: data.description || '',
      data: data.data,
      state: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return newBeneficiary;
  },

  updateBeneficiary: async (id: string, data: Partial<Beneficiary>): Promise<Beneficiary> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const beneficiary = mockBeneficiaries.find(b => b.id === id);
    if (!beneficiary) {
      throw new Error('Beneficiary not found');
    }

    return { ...beneficiary, ...data, updated_at: new Date().toISOString() };
  },

  deleteBeneficiary: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // In a real app, this would delete the beneficiary
  },

  getDepositAddress: async (currency: string): Promise<{
    currency: string;
    address: string;
  }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const balance = mockAccountBalances.find(b => b.currency === currency);
    if (!balance?.deposit_address) {
      throw new Error('Deposit address not found');
    }

    return {
      currency,
      address: balance.deposit_address,
    };
  },

  getHistory: async (params?: {
    currency?: string;
    limit?: number;
    page?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    start_date?: string;
    end_date?: string;
    filter?: string;
  }): Promise<{
    deposits: AccountDeposit[];
    withdrawals: AccountWithdraw[];
  }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let deposits = mockDeposits;
    let withdrawals = mockWithdrawals;
    
    if (params?.currency) {
      deposits = deposits.filter(d => d.currency === params.currency);
      withdrawals = withdrawals.filter(w => w.currency === params.currency);
    }
    
    return { deposits, withdrawals };
  },
};

// React Query hooks
export const useAccountBalances = () => {
  return useQuery({
    queryKey: ['account', 'balances'],
    queryFn: mockApi.getBalances,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useAccountBalance = (currency: string) => {
  return useQuery({
    queryKey: ['account', 'balance', currency],
    queryFn: () => mockApi.getBalance(currency),
    enabled: !!currency,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useAccountDeposits = (params?: {
  currency?: string;
  limit?: number;
  page?: number;
}) => {
  return useQuery({
    queryKey: ['account', 'deposits', params],
    queryFn: () => mockApi.getDeposits(params),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useAccountDeposit = (id: string) => {
  return useQuery({
    queryKey: ['account', 'deposit', id],
    queryFn: () => mockApi.getDeposit(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useCreateDeposit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockApi.createDeposit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'deposits'] });
      queryClient.invalidateQueries({ queryKey: ['account', 'balances'] });
    },
  });
};

export const useAccountWithdrawals = (params?: {
  currency?: string;
  limit?: number;
  page?: number;
}) => {
  return useQuery({
    queryKey: ['account', 'withdrawals', params],
    queryFn: () => mockApi.getWithdrawals(params),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useAccountWithdrawal = (id: string) => {
  return useQuery({
    queryKey: ['account', 'withdrawal', id],
    queryFn: () => mockApi.getWithdrawal(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useCreateWithdrawal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockApi.createWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['account', 'balances'] });
    },
  });
};

export const useBeneficiaries = () => {
  return useQuery({
    queryKey: ['account', 'beneficiaries'],
    queryFn: mockApi.getBeneficiaries,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBeneficiary = (id: string) => {
  return useQuery({
    queryKey: ['account', 'beneficiary', id],
    queryFn: () => mockApi.getBeneficiary(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateBeneficiary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockApi.createBeneficiary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'beneficiaries'] });
    },
  });
};

export const useUpdateBeneficiary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Beneficiary> }) => mockApi.updateBeneficiary(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'beneficiaries'] });
    },
  });
};

export const useDeleteBeneficiary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockApi.deleteBeneficiary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'beneficiaries'] });
    },
  });
};

export const useDepositAddress = (currency: string) => {
  return useQuery({
    queryKey: ['account', 'deposit_address', currency],
    queryFn: () => mockApi.getDepositAddress(currency),
    enabled: !!currency,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAccountHistory = (params?: {
  currency?: string;
  limit?: number;
  page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  start_date?: string;
  end_date?: string;
  filter?: string;
}) => {
  return useQuery({
    queryKey: ['account', 'history', params],
    queryFn: () => mockApi.getHistory(params),
    staleTime: 60 * 1000, // 1 minute
  });
};

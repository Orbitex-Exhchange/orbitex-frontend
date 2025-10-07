import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { apiConfig } from '@/lib/api-client/config';

// ===== TYPES =====

export interface WalletBalance {
  currency: string;
  balance: string;
  locked: string;
  available: string;
  total: string;
}

export interface WalletState {
  balances: WalletBalance[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export interface WalletActions {
  setBalances: (balances: WalletBalance[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchBalances: () => Promise<void>;
  clearError: () => void;
  updateBalance: (currency: string, balance: string, locked: string) => void;
}

// ===== WALLET STORE =====

export const useWalletStore = create<WalletState & WalletActions>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    balances: [],
    isLoading: false,
    error: null,
    lastUpdated: null,

    // Actions
    setBalances: (balances: WalletBalance[]) => {
      set({ 
        balances, 
        lastUpdated: Date.now(),
        error: null 
      });
    },

    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },

    setError: (error: string | null) => {
      set({ error });
    },

    fetchBalances: async () => {
      set({ isLoading: true, error: null });
      
      try {
        // Try the V2 API first
        const response = await fetch(`${apiConfig.baseUrl}/api/api_v2/account/balances`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch balances');
        }

        const data = await response.json();
        set({ 
          balances: data.data || data, 
          isLoading: false,
          error: null,
          lastUpdated: Date.now()
        });
      } catch (error) {
        console.error('Error fetching balances:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch balances',
          isLoading: false 
        });
      }
    },

    clearError: () => {
      set({ error: null });
    },

    updateBalance: (currency: string, balance: string, locked: string) => {
      set((state) => ({
        balances: state.balances.map(b => 
          b.currency === currency 
            ? { 
                ...b, 
                balance, 
                locked, 
                available: (parseFloat(balance) - parseFloat(locked)).toString(),
                total: balance
              }
            : b
        )
      }));
    },
  }))
);

// ===== SELECTORS =====

export const useBalances = () => useWalletStore((state) => state.balances);
export const useWalletLoading = () => useWalletStore((state) => state.isLoading);
export const useWalletError = () => useWalletStore((state) => state.error);
export const useLastUpdated = () => useWalletStore((state) => state.lastUpdated);

// ===== CONVENIENCE HOOKS =====

export const useBalanceByCurrency = (currency: string) => 
  useWalletStore((state) => state.balances.find(b => b.currency === currency));

export const useTotalBalance = () => 
  useWalletStore((state) => 
    state.balances.reduce((total, balance) => total + parseFloat(balance.total || '0'), 0)
  );

// ===== ACTIONS =====

export const walletActions = {
  setBalances: useWalletStore.getState().setBalances,
  setLoading: useWalletStore.getState().setLoading,
  setError: useWalletStore.getState().setError,
  fetchBalances: useWalletStore.getState().fetchBalances,
  clearError: useWalletStore.getState().clearError,
  updateBalance: useWalletStore.getState().updateBalance,
};

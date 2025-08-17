import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Wallet {
  currency: string;
  balance: string;
  locked: string;
  available: string;
  icon?: string;
  name?: string;
  type?: 'crypto' | 'fiat';
  deposit_enabled?: boolean;
  withdrawal_enabled?: boolean;
}

export interface WalletHistory {
  id: number;
  currency: string;
  amount: string;
  fee: string;
  txid: string;
  created_at: string;
  confirmations: number;
  completed_at: string;
  state: string;
  type: 'deposit' | 'withdrawal' | 'trade';
}

export interface Beneficiary {
  id: number;
  currency: string;
  name: string;
  description?: string;
  data: {
    address?: string;
    bank_name?: string;
    full_name?: string;
    account_number?: string;
  };
  state: string;
}

export interface DepositAddress {
  currency: string;
  address: string;
}

export interface WalletsState {
  // Wallet data
  wallets: Wallet[];
  selectedWallet: Wallet | null;
  
  // History
  history: WalletHistory[];
  historyLoading: boolean;
  historyError: string | null;
  
  // Beneficiaries
  beneficiaries: Beneficiary[];
  beneficiariesLoading: boolean;
  beneficiariesError: string | null;
  
  // Deposit addresses
  depositAddresses: { [currency: string]: DepositAddress };
  depositAddressesLoading: boolean;
  depositAddressesError: string | null;
  
  // UI state
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  setWallets: (wallets: Wallet[]) => void;
  setSelectedWallet: (wallet: Wallet | null) => void;
  updateWallet: (currency: string, updates: Partial<Wallet>) => void;
  
  setHistory: (history: WalletHistory[]) => void;
  setHistoryLoading: (loading: boolean) => void;
  setHistoryError: (error: string | null) => void;
  
  setBeneficiaries: (beneficiaries: Beneficiary[]) => void;
  setBeneficiariesLoading: (loading: boolean) => void;
  setBeneficiariesError: (error: string | null) => void;
  
  setDepositAddress: (currency: string, address: DepositAddress) => void;
  setDepositAddressesLoading: (loading: boolean) => void;
  setDepositAddressesError: (error: string | null) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastUpdated: (date: Date) => void;
  
  // Complex actions
  fetchWallets: () => Promise<void>;
  fetchHistory: (currency?: string, limit?: number, page?: number) => Promise<void>;
  fetchBeneficiaries: () => Promise<void>;
  fetchDepositAddress: (currency: string) => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Reset
  reset: () => void;
}

const initialState = {
  wallets: [],
  selectedWallet: null,
  history: [],
  historyLoading: false,
  historyError: null,
  beneficiaries: [],
  beneficiariesLoading: false,
  beneficiariesError: null,
  depositAddresses: {},
  depositAddressesLoading: false,
  depositAddressesError: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

export const useWalletsStore = create<WalletsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Basic setters
      setWallets: (wallets) => set({ wallets }),
      setSelectedWallet: (wallet) => set({ selectedWallet: wallet }),
      updateWallet: (currency, updates) => set((state) => ({
        wallets: state.wallets.map(wallet =>
          wallet.currency === currency ? { ...wallet, ...updates } : wallet
        ),
      })),

      setHistory: (history) => set({ history }),
      setHistoryLoading: (loading) => set({ historyLoading: loading }),
      setHistoryError: (error) => set({ historyError: error }),

      setBeneficiaries: (beneficiaries) => set({ beneficiaries }),
      setBeneficiariesLoading: (loading) => set({ beneficiariesLoading: loading }),
      setBeneficiariesError: (error) => set({ beneficiariesError: error }),

      setDepositAddress: (currency, address) => set((state) => ({
        depositAddresses: { ...state.depositAddresses, [currency]: address },
      })),
      setDepositAddressesLoading: (loading) => set({ depositAddressesLoading: loading }),
      setDepositAddressesError: (error) => set({ depositAddressesError: error }),

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setLastUpdated: (date) => set({ lastUpdated: date }),

      // Complex actions
      fetchWallets: async () => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with real API call
          // const response = await fetch('/api/v2/peatio/account/balances');
          // const data = await response.json();
          
          // Mock data for now
          const mockData: Wallet[] = [
            {
              currency: 'BTC',
              balance: '0.25000000',
              locked: '0.05000000',
              available: '0.20000000',
              name: 'Bitcoin',
              type: 'crypto',
              deposit_enabled: true,
              withdrawal_enabled: true,
            },
            {
              currency: 'ETH',
              balance: '2.50000000',
              locked: '0.50000000',
              available: '2.00000000',
              name: 'Ethereum',
              type: 'crypto',
              deposit_enabled: true,
              withdrawal_enabled: true,
            },
            {
              currency: 'USDT',
              balance: '12500.50',
              locked: '500.50',
              available: '12000.00',
              name: 'Tether USD',
              type: 'crypto',
              deposit_enabled: true,
              withdrawal_enabled: true,
            },
            {
              currency: 'SOL',
              balance: '50.00000000',
              locked: '5.00000000',
              available: '45.00000000',
              name: 'Solana',
              type: 'crypto',
              deposit_enabled: true,
              withdrawal_enabled: true,
            },
            {
              currency: 'USD',
              balance: '1000.00',
              locked: '0.00',
              available: '1000.00',
              name: 'US Dollar',
              type: 'fiat',
              deposit_enabled: true,
              withdrawal_enabled: true,
            },
            {
              currency: 'EUR',
              balance: '850.00',
              locked: '0.00',
              available: '850.00',
              name: 'Euro',
              type: 'fiat',
              deposit_enabled: true,
              withdrawal_enabled: true,
            },
          ];

          set({ wallets: mockData, loading: false, lastUpdated: new Date() });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch wallets';
          set({ error: errorMessage, loading: false });
        }
      },

      fetchHistory: async (currency, limit = 25, page = 1) => {
        set({ historyLoading: true, historyError: null });
        try {
          // TODO: Replace with real API call
          // const params = new URLSearchParams();
          // if (currency) params.append('currency', currency);
          // params.append('limit', limit.toString());
          // params.append('page', page.toString());
          // const response = await fetch(`/api/v2/peatio/account/history?${params}`);
          // const data = await response.json();

          // Mock history data
          const mockHistory: WalletHistory[] = [
            {
              id: 1,
              currency: 'BTC',
              amount: '0.001',
              fee: '0.0',
              txid: 'abc123...',
              created_at: '2024-01-15T10:30:00Z',
              confirmations: 6,
              completed_at: '2024-01-15T10:35:00Z',
              state: 'accepted',
              type: 'deposit',
            },
            {
              id: 2,
              currency: 'ETH',
              amount: '0.1',
              fee: '0.0',
              txid: 'def456...',
              created_at: '2024-01-14T15:20:00Z',
              confirmations: 12,
              completed_at: '2024-01-14T15:25:00Z',
              state: 'accepted',
              type: 'withdrawal',
            },
          ];

          set({ history: mockHistory, historyLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch history';
          set({ historyError: errorMessage, historyLoading: false });
        }
      },

      fetchBeneficiaries: async () => {
        set({ beneficiariesLoading: true, beneficiariesError: null });
        try {
          // TODO: Replace with real API call
          // const response = await fetch('/api/v2/peatio/account/beneficiaries');
          // const data = await response.json();

          // Mock beneficiaries data
          const mockBeneficiaries: Beneficiary[] = [
            {
              id: 1,
              currency: 'BTC',
              name: 'My Bitcoin Wallet',
              data: { address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
              state: 'active',
            },
            {
              id: 2,
              currency: 'USD',
              name: 'My Bank Account',
              data: {
                bank_name: 'Example Bank',
                full_name: 'John Doe',
                account_number: '1234567890',
              },
              state: 'active',
            },
          ];

          set({ beneficiaries: mockBeneficiaries, beneficiariesLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch beneficiaries';
          set({ beneficiariesError: errorMessage, beneficiariesLoading: false });
        }
      },

      fetchDepositAddress: async (currency) => {
        set({ depositAddressesLoading: true, depositAddressesError: null });
        try {
          // TODO: Replace with real API call
          // const response = await fetch(`/api/v2/peatio/account/deposit_address/${currency}`);
          // const data = await response.json();

          // Mock deposit address data
          const mockAddress: DepositAddress = {
            currency,
            address: `mock-address-for-${currency.toLowerCase()}`,
          };

          set((state) => ({
            depositAddresses: { ...state.depositAddresses, [currency]: mockAddress },
            depositAddressesLoading: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch deposit address';
          set({ depositAddressesError: errorMessage, depositAddressesLoading: false });
        }
      },

      refreshAll: async () => {
        const { fetchWallets, fetchHistory, fetchBeneficiaries } = get();
        await Promise.all([
          fetchWallets(),
          fetchHistory(),
          fetchBeneficiaries(),
        ]);
      },

      reset: () => set(initialState),
    }),
    {
      name: 'wallets-storage',
      partialize: (state) => ({
        wallets: state.wallets,
        selectedWallet: state.selectedWallet,
        beneficiaries: state.beneficiaries,
        depositAddresses: state.depositAddresses,
      }),
    }
  )
);

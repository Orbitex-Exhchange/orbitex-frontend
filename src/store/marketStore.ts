import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { apiConfig } from '@/lib/api-client/config';

// ===== TYPES =====

export interface Market {
  id: string;
  name: string;
  base_unit: string;
  quote_unit: string;
  min_price: string;
  max_price: string;
  min_amount: string;
  amount_precision: number;
  price_precision: number;
  state: string;
  position: number;
}

export interface Ticker {
  market: string;
  last: string;
  open: string;
  high: string;
  low: string;
  volume: string;
  amount: string;
  change: string;
  change_percent: string;
  at: number;
}

export interface MarketState {
  markets: Market[];
  tickers: Ticker[];
  selectedMarket: string | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export interface MarketActions {
  setMarkets: (markets: Market[]) => void;
  setTickers: (tickers: Ticker[]) => void;
  setSelectedMarket: (market: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchMarkets: () => Promise<void>;
  fetchTickers: () => Promise<void>;
  clearError: () => void;
}

// ===== MARKET STORE =====

export const useMarketStore = create<MarketState & MarketActions>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    markets: [],
    tickers: [],
    selectedMarket: null,
    isLoading: false,
    error: null,
    lastUpdated: null,

    // Actions
    setMarkets: (markets: Market[]) => {
      set({ 
        markets, 
        error: null 
      });
    },

    setTickers: (tickers: Ticker[]) => {
      set({ 
        tickers, 
        lastUpdated: Date.now(),
        error: null 
      });
    },

    setSelectedMarket: (market: string | null) => {
      set({ selectedMarket: market });
    },

    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },

    setError: (error: string | null) => {
      set({ error });
    },

    fetchMarkets: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await fetch(`${apiConfig.baseUrl}/api/api_v2/public/markets`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch markets');
        }

        const data = await response.json();
        set({ 
          markets: data.data || data, 
          isLoading: false,
          error: null
        });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch markets',
          isLoading: false 
        });
      }
    },

    fetchTickers: async () => {
      set({ isLoading: true, error: null });
      
      try {
        // Create an AbortController for timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`${apiConfig.baseUrl}/api/api_v2/public/markets/tickers`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch tickers');
        }

        const data = await response.json();
        set({ 
          tickers: data.data || data, 
          isLoading: false,
          error: null,
          lastUpdated: Date.now()
        });
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          set({ 
            error: 'Tickers service is currently unavailable. Using cached data.',
            isLoading: false 
          });
        } else {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch tickers',
            isLoading: false 
          });
        }
      }
    },

    clearError: () => {
      set({ error: null });
    },
  }))
);

// ===== SELECTORS =====

export const useMarkets = () => useMarketStore((state) => state.markets);
export const useTickers = () => useMarketStore((state) => state.tickers);
export const useSelectedMarket = () => useMarketStore((state) => state.selectedMarket);
export const useMarketLoading = () => useMarketStore((state) => state.isLoading);
export const useMarketError = () => useMarketStore((state) => state.error);
export const useMarketLastUpdated = () => useMarketStore((state) => state.lastUpdated);

// ===== CONVENIENCE HOOKS =====

export const useMarketById = (id: string) => 
  useMarketStore((state) => state.markets.find(m => m.id === id));

export const useTickerByMarket = (market: string) => 
  useMarketStore((state) => state.tickers.find(t => t.market === market));

export const useActiveMarkets = () => 
  useMarketStore((state) => state.markets.filter(m => m.state === 'enabled'));

// ===== ACTIONS =====

export const marketActions = {
  setMarkets: useMarketStore.getState().setMarkets,
  setTickers: useMarketStore.getState().setTickers,
  setSelectedMarket: useMarketStore.getState().setSelectedMarket,
  setLoading: useMarketStore.getState().setLoading,
  setError: useMarketStore.getState().setError,
  fetchMarkets: useMarketStore.getState().fetchMarkets,
  fetchTickers: useMarketStore.getState().fetchTickers,
  clearError: useMarketStore.getState().clearError,
};

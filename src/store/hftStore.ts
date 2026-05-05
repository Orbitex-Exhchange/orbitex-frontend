import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';


// ===== TYPES =====

export interface MarketDepth {
  market: string;
  asks: [string, string][];
  bids: [string, string][];
  spread: number;
  timestamp: number;
}

export interface RealTimeTrade {
  id: number;
  price: string;
  volume: string;
  funds: string;
  side: string;
  created_at: number;
}

export interface VolumeProfile {
  market: string;
  period: number;
  volume_profile: Record<string, number>;
  total_volume: number;
  timestamp: number;
}

export interface PriceVelocity {
  market: string;
  velocity: number;
  direction: 'up' | 'down' | 'neutral';
  price_change: number;
  period: number;
  timestamp: number;
}

export interface HFTMarketData {
  market: string;
  ticker: any;
  order_book: {
    asks: [string, string][];
    bids: [string, string][];
    spread: number;
  };
  trades: RealTimeTrade[];
  timestamp: number;
}

export interface HFTState {
  marketDepth: MarketDepth | null;
  realTimeTrades: RealTimeTrade[];
  volumeProfile: VolumeProfile | null;
  priceVelocity: PriceVelocity | null;
  marketData: HFTMarketData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  selectedMarket: string | null;
}

export interface HFTActions {
  setMarketDepth: (depth: MarketDepth | null) => void;
  setRealTimeTrades: (trades: RealTimeTrade[]) => void;
  setVolumeProfile: (profile: VolumeProfile | null) => void;
  setPriceVelocity: (velocity: PriceVelocity | null) => void;
  setMarketData: (data: HFTMarketData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedMarket: (market: string | null) => void;
  fetchMarketDepth: (market: string, limit?: number) => Promise<void>;
  fetchRealTimeTrades: (market: string, limit?: number) => Promise<void>;
  fetchVolumeProfile: (market: string, period?: number) => Promise<void>;
  fetchPriceVelocity: (market: string, period?: number) => Promise<void>;
  fetchAllMarketData: (market: string, depthLimit?: number, tradesLimit?: number) => Promise<void>;
  clearError: () => void;
}

// ===== HFT STORE =====

export const useHFTStore = create<HFTState & HFTActions>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    marketDepth: null,
    realTimeTrades: [],
    volumeProfile: null,
    priceVelocity: null,
    marketData: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
    selectedMarket: null,

    // Actions
    setMarketDepth: (marketDepth) => set({ marketDepth }),
    setRealTimeTrades: (realTimeTrades) => set({ realTimeTrades }),
    setVolumeProfile: (volumeProfile) => set({ volumeProfile }),
    setPriceVelocity: (priceVelocity) => set({ priceVelocity }),
    setMarketData: (marketData) => set({ marketData }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setSelectedMarket: (selectedMarket) => set({ selectedMarket }),

    fetchMarketDepth: async (market: string, limit = 20) => {
      set({ isLoading: true, error: null });
      try {
        const { apiClient } = await import('@/lib/api/client');
        const response = await apiClient.get<any>(`/api/v2/public/hft/market-depth/${market}?limit=${limit}`);

        set({
          marketDepth: response.data,
          isLoading: false,
          lastUpdated: Date.now()
        });
      } catch (error: any) {
        set({
          error: error.message || 'Failed to fetch market depth',
          isLoading: false
        });
      }
    },

    fetchRealTimeTrades: async (market: string, limit = 50) => {
      set({ isLoading: true, error: null });
      try {
        const { apiClient } = await import('@/lib/api/client');
        const response = await apiClient.get<any>(`/api/v2/public/hft/trades/${market}?limit=${limit}`);

        set({
          realTimeTrades: response.data.trades,
          isLoading: false,
          lastUpdated: Date.now()
        });
      } catch (error: any) {
        set({
          error: error.message || 'Failed to fetch real-time trades',
          isLoading: false
        });
      }
    },

    fetchVolumeProfile: async (market: string, period = 3600) => {
      set({ isLoading: true, error: null });
      try {
        const { apiClient } = await import('@/lib/api/client');
        const response = await apiClient.get<any>(`/api/v2/public/hft/volume-profile/${market}?period=${period}`);

        set({
          volumeProfile: response.data,
          isLoading: false,
          lastUpdated: Date.now()
        });
      } catch (error: any) {
        set({
          error: error.message || 'Failed to fetch volume profile',
          isLoading: false
        });
      }
    },

    fetchPriceVelocity: async (market: string, period = 300) => {
      set({ isLoading: true, error: null });
      try {
        const { apiClient } = await import('@/lib/api/client');
        const response = await apiClient.get<any>(`/api/v2/public/hft/price-velocity/${market}?period=${period}`);

        set({
          priceVelocity: response.data,
          isLoading: false,
          lastUpdated: Date.now()
        });
      } catch (error: any) {
        set({
          error: error.message || 'Failed to fetch price velocity',
          isLoading: false
        });
      }
    },

    fetchAllMarketData: async (market: string, depthLimit = 20, tradesLimit = 50) => {
      set({ isLoading: true, error: null });
      try {
        const { apiClient } = await import('@/lib/api/client');
        const response = await apiClient.get<any>(`/api/v2/public/hft/market-data/${market}?depth_limit=${depthLimit}&trades_limit=${tradesLimit}`);

        set({
          marketData: response.data,
          isLoading: false,
          lastUpdated: Date.now()
        });
      } catch (error: any) {
        set({
          error: error.message || 'Failed to fetch market data',
          isLoading: false
        });
      }
    },

    clearError: () => set({ error: null }),
  }))
);

// ===== SELECTORS =====

export const useMarketDepth = () => useHFTStore(state => state.marketDepth);
export const useRealTimeTrades = () => useHFTStore(state => state.realTimeTrades);
export const useVolumeProfile = () => useHFTStore(state => state.volumeProfile);
export const usePriceVelocity = () => useHFTStore(state => state.priceVelocity);
export const useMarketData = () => useHFTStore(state => state.marketData);
export const useHFTLoading = () => useHFTStore(state => state.isLoading);
export const useHFTError = () => useHFTStore(state => state.error);
export const useSelectedMarket = () => useHFTStore(state => state.selectedMarket);

// ===== ACTIONS =====

export const hftActions = {
  fetchMarketDepth: (market: string, limit?: number) => useHFTStore.getState().fetchMarketDepth(market, limit),
  fetchRealTimeTrades: (market: string, limit?: number) => useHFTStore.getState().fetchRealTimeTrades(market, limit),
  fetchVolumeProfile: (market: string, period?: number) => useHFTStore.getState().fetchVolumeProfile(market, period),
  fetchPriceVelocity: (market: string, period?: number) => useHFTStore.getState().fetchPriceVelocity(market, period),
  fetchAllMarketData: (market: string, depthLimit?: number, tradesLimit?: number) => useHFTStore.getState().fetchAllMarketData(market, depthLimit, tradesLimit),
  setSelectedMarket: (market: string | null) => useHFTStore.getState().setSelectedMarket(market),
  clearError: () => useHFTStore.getState().clearError(),
};

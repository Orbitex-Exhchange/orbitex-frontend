import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { normalizeMarketId, toFiniteNumber } from '@/lib/utils';

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

const normalizeSide = (rows: any): [string, string][] => {
  if (!Array.isArray(rows)) return [];
  return rows.map((row: any): [string, string] | null => {
    if (Array.isArray(row)) return [String(row[0] ?? '0'), String(row[1] ?? '0')];
    const price = row?.price;
    const volume = row?.quantity ?? row?.remaining_volume ?? row?.origin_volume ?? row?.volume ?? row?.amount ?? row?.size;
    return price === undefined || volume === undefined ? null : [String(price), String(volume)];
  }).filter((row: [string, string] | null): row is [string, string] => Boolean(row));
};

const normalizeTrades = (rows: any): RealTimeTrade[] => {
  if (!Array.isArray(rows)) return [];
  return rows.map((trade: any, index: number) => ({
    id: Number(trade?.id ?? index),
    price: String(trade?.price ?? '0'),
    volume: String(trade?.volume ?? trade?.amount ?? trade?.quantity ?? '0'),
    funds: String(trade?.total ?? toFiniteNumber(trade?.price) * toFiniteNumber(trade?.amount ?? trade?.volume ?? trade?.quantity)),
    side: String(trade?.side ?? trade?.taker_type ?? 'buy'),
    created_at: Number(trade?.created_at ?? Date.now()),
  }));
};

const calculateSpread = (asks: [string, string][], bids: [string, string][]) => {
  const bestAsk = toFiniteNumber(asks[0]?.[0]);
  const bestBid = toFiniteNumber(bids[0]?.[0]);
  return bestAsk && bestBid ? bestAsk - bestBid : 0;
};

export const useHFTStore = create<HFTState & HFTActions>()(
  subscribeWithSelector((set) => ({
    marketDepth: null,
    realTimeTrades: [],
    volumeProfile: null,
    priceVelocity: null,
    marketData: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
    selectedMarket: null,

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
        const symbol = normalizeMarketId(market);
        const response = await apiClient.get<any>(`/api/v2/public/markets/${symbol}/order-book`, {
          params: { asks_limit: limit, bids_limit: limit },
        });
        const payload = response.data?.data || response.data || {};
        const asks = normalizeSide(payload.asks);
        const bids = normalizeSide(payload.bids);
        set({ marketDepth: { market: symbol, asks, bids, spread: calculateSpread(asks, bids), timestamp: Number(payload.timestamp || Date.now()) }, isLoading: false, lastUpdated: Date.now() });
      } catch (error: any) {
        set({ error: error.message || 'Failed to fetch market depth', isLoading: false });
      }
    },

    fetchRealTimeTrades: async (market: string, limit = 50) => {
      set({ isLoading: true, error: null });
      try {
        const { apiClient } = await import('@/lib/api/client');
        const symbol = normalizeMarketId(market);
        const response = await apiClient.get<any>(`/api/v2/public/markets/${symbol}/trades`, { params: { limit } });
        set({ realTimeTrades: normalizeTrades(response.data?.data || response.data), isLoading: false, lastUpdated: Date.now() });
      } catch (error: any) {
        set({ error: error.message || 'Failed to fetch real-time trades', isLoading: false });
      }
    },

    fetchVolumeProfile: async (market: string, period = 3600) => {
      set({ isLoading: true, error: null });
      try {
        const { apiClient } = await import('@/lib/api/client');
        const symbol = normalizeMarketId(market);
        const response = await apiClient.get<any>(`/api/v2/public/markets/${symbol}/trades`, { params: { limit: 200 } });
        const trades = normalizeTrades(response.data?.data || response.data);
        const volume_profile = trades.reduce<Record<string, number>>((profile, trade) => {
          const bucket = Math.round(toFiniteNumber(trade.price) / 100) * 100;
          const key = String(bucket || 0);
          profile[key] = (profile[key] || 0) + toFiniteNumber(trade.volume);
          return profile;
        }, {});
        const total_volume = Object.values(volume_profile).reduce((sum, value) => sum + value, 0);
        set({ volumeProfile: { market: symbol, period, volume_profile, total_volume, timestamp: Date.now() }, isLoading: false, lastUpdated: Date.now() });
      } catch (error: any) {
        set({ error: error.message || 'Failed to fetch volume profile', isLoading: false });
      }
    },

    fetchPriceVelocity: async (market: string, period = 300) => {
      set({ isLoading: true, error: null });
      try {
        const { apiClient } = await import('@/lib/api/client');
        const symbol = normalizeMarketId(market);
        const response = await apiClient.get<any>(`/api/v2/public/markets/${symbol}/k-line`, { params: { period: 1, limit: 30 } });
        const rows = Array.isArray(response.data?.k_line) ? response.data.k_line : [];
        const first = rows[0];
        const last = rows[rows.length - 1];
        const firstClose = Array.isArray(first) ? toFiniteNumber(first[4]) : toFiniteNumber(first?.close);
        const lastClose = Array.isArray(last) ? toFiniteNumber(last[4]) : toFiniteNumber(last?.close);
        const price_change = lastClose - firstClose;
        const velocity = firstClose ? (price_change / firstClose) * 100 : 0;
        const direction: PriceVelocity['direction'] = velocity > 0 ? 'up' : velocity < 0 ? 'down' : 'neutral';
        set({ priceVelocity: { market: symbol, velocity, direction, price_change, period, timestamp: Date.now() }, isLoading: false, lastUpdated: Date.now() });
      } catch (error: any) {
        set({ error: error.message || 'Failed to fetch price velocity', isLoading: false });
      }
    },

    fetchAllMarketData: async (market: string, depthLimit = 20, tradesLimit = 50) => {
      set({ isLoading: true, error: null });
      try {
        const { apiClient } = await import('@/lib/api/client');
        const symbol = normalizeMarketId(market);
        const [tickerResponse, depthResponse, tradesResponse] = await Promise.all([
          apiClient.get<any>('/api/v2/public/tickers'),
          apiClient.get<any>(`/api/v2/public/markets/${symbol}/order-book`, { params: { asks_limit: depthLimit, bids_limit: depthLimit } }),
          apiClient.get<any>(`/api/v2/public/markets/${symbol}/trades`, { params: { limit: tradesLimit } }),
        ]);
        const ticker = tickerResponse.data?.[symbol] || tickerResponse.data?.data?.[symbol] || null;
        const depthPayload = depthResponse.data?.data || depthResponse.data || {};
        const asks = normalizeSide(depthPayload.asks);
        const bids = normalizeSide(depthPayload.bids);
        const trades = normalizeTrades(tradesResponse.data?.data || tradesResponse.data);
        set({ marketData: { market: symbol, ticker, order_book: { asks, bids, spread: calculateSpread(asks, bids) }, trades, timestamp: Date.now() }, isLoading: false, lastUpdated: Date.now() });
      } catch (error: any) {
        set({ error: error.message || 'Failed to fetch market data', isLoading: false });
      }
    },

    clearError: () => set({ error: null }),
  }))
);

export const useMarketDepth = () => useHFTStore(state => state.marketDepth);
export const useRealTimeTrades = () => useHFTStore(state => state.realTimeTrades);
export const useVolumeProfile = () => useHFTStore(state => state.volumeProfile);
export const usePriceVelocity = () => useHFTStore(state => state.priceVelocity);
export const useMarketData = () => useHFTStore(state => state.marketData);
export const useHFTLoading = () => useHFTStore(state => state.isLoading);
export const useHFTError = () => useHFTStore(state => state.error);
export const useSelectedMarket = () => useHFTStore(state => state.selectedMarket);

export const hftActions = {
  fetchMarketDepth: (market: string, limit?: number) => useHFTStore.getState().fetchMarketDepth(market, limit),
  fetchRealTimeTrades: (market: string, limit?: number) => useHFTStore.getState().fetchRealTimeTrades(market, limit),
  fetchVolumeProfile: (market: string, period?: number) => useHFTStore.getState().fetchVolumeProfile(market, period),
  fetchPriceVelocity: (market: string, period?: number) => useHFTStore.getState().fetchPriceVelocity(market, period),
  fetchAllMarketData: (market: string, depthLimit?: number, tradesLimit?: number) => useHFTStore.getState().fetchAllMarketData(market, depthLimit, tradesLimit),
  setSelectedMarket: (market: string | null) => useHFTStore.getState().setSelectedMarket(market),
  clearError: () => useHFTStore.getState().clearError(),
};

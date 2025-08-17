import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import { 
  PublicMarket, 
  PublicCurrency, 
  PublicTicker, 
  PublicOrderBook, 
  PublicTrade, 
  PublicKLine,
  PublicDepth,
  PublicMemberLevel,
  PublicFeeGroup,
  PublicFee,
  mockPublicMarkets,
  mockPublicCurrencies,
  mockPublicTickers,
  mockPublicOrderBook,
  mockPublicTrades,
  mockPublicKLines,
  mockPublicMemberLevels,
  mockPublicFeeGroups,
  mockPublicFees
} from '../mock-data/enhanced';

// Public API endpoints
const PUBLIC_ENDPOINTS = {
  markets: '/api/v2/peatio/public/markets',
  currencies: '/api/v2/peatio/public/currencies',
  tickers: '/api/v2/peatio/public/markets/tickers',
  orderBook: '/api/v2/peatio/public/markets/:id/order-book',
  trades: '/api/v2/peatio/public/markets/:id/trades',
  kLines: '/api/v2/peatio/public/markets/:id/k-line',
  depth: '/api/v2/peatio/public/markets/:id/depth',
  memberLevels: '/api/v2/peatio/public/member-levels',
  feeGroups: '/api/v2/peatio/public/fee_groups',
  fees: '/api/v2/peatio/public/fees',
  timestamp: '/api/v2/peatio/public/timestamp',
} as const;

// Mock API functions
const mockApi = {
  getMarkets: async (): Promise<PublicMarket[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPublicMarkets;
  },

  getMarket: async (id: string): Promise<PublicMarket | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPublicMarkets.find(m => m.id === id) || null;
  },

  getCurrencies: async (): Promise<PublicCurrency[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPublicCurrencies;
  },

  getCurrency: async (id: string): Promise<PublicCurrency | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPublicCurrencies.find(c => c.id === id) || null;
  },

  getTickers: async (): Promise<PublicTicker[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPublicTickers;
  },

  getTicker: async (market: string): Promise<PublicTicker | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPublicTickers.find(t => t.name === market) || null;
  },

  getOrderBook: async (market: string, limit?: number): Promise<PublicOrderBook> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPublicOrderBook;
  },

  getTrades: async (market: string, limit?: number): Promise<PublicTrade[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPublicTrades.filter(t => t.market === market);
  },

  getKLines: async (market: string, period: string = '1m', time_from?: number, time_to?: number, limit?: number): Promise<PublicKLine[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPublicKLines;
  },

  getDepth: async (market: string, limit?: number): Promise<PublicDepth> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPublicOrderBook; // Using order book as depth for simplicity
  },

  getMemberLevels: async (): Promise<PublicMemberLevel[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPublicMemberLevels;
  },

  getFeeGroups: async (): Promise<PublicFeeGroup[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPublicFeeGroups;
  },

  getFees: async (type: 'deposit' | 'withdraw' | 'trading'): Promise<PublicFee[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPublicFees;
  },

  getTimestamp: async (): Promise<number> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Math.floor(Date.now() / 1000);
  },
};

// React Query hooks
export const usePublicMarkets = () => {
  return useQuery({
    queryKey: ['public', 'markets'],
    queryFn: mockApi.getMarkets,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePublicMarket = (id: string) => {
  return useQuery({
    queryKey: ['public', 'market', id],
    queryFn: () => mockApi.getMarket(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePublicCurrencies = () => {
  return useQuery({
    queryKey: ['public', 'currencies'],
    queryFn: mockApi.getCurrencies,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePublicCurrency = (id: string) => {
  return useQuery({
    queryKey: ['public', 'currency', id],
    queryFn: () => mockApi.getCurrency(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePublicTickers = () => {
  return useQuery({
    queryKey: ['public', 'tickers'],
    queryFn: mockApi.getTickers,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds
  });
};

export const usePublicTicker = (market: string) => {
  return useQuery({
    queryKey: ['public', 'ticker', market],
    queryFn: () => mockApi.getTicker(market),
    enabled: !!market,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds
  });
};

export const usePublicOrderBook = (market: string, limit?: number) => {
  return useQuery({
    queryKey: ['public', 'orderbook', market, limit],
    queryFn: () => mockApi.getOrderBook(market, limit),
    enabled: !!market,
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 5 * 1000, // Refetch every 5 seconds
  });
};

export const usePublicTrades = (market: string, limit?: number) => {
  return useQuery({
    queryKey: ['public', 'trades', market, limit],
    queryFn: () => mockApi.getTrades(market, limit),
    enabled: !!market,
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 5 * 1000, // Refetch every 5 seconds
  });
};

export const usePublicKLines = (
  market: string, 
  period: string = '1m', 
  time_from?: number, 
  time_to?: number, 
  limit?: number
) => {
  return useQuery({
    queryKey: ['public', 'klines', market, period, time_from, time_to, limit],
    queryFn: () => mockApi.getKLines(market, period, time_from, time_to, limit),
    enabled: !!market,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const usePublicDepth = (market: string, limit?: number) => {
  return useQuery({
    queryKey: ['public', 'depth', market, limit],
    queryFn: () => mockApi.getDepth(market, limit),
    enabled: !!market,
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 5 * 1000, // Refetch every 5 seconds
  });
};

export const usePublicMemberLevels = () => {
  return useQuery({
    queryKey: ['public', 'member_levels'],
    queryFn: mockApi.getMemberLevels,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const usePublicFeeGroups = () => {
  return useQuery({
    queryKey: ['public', 'fee_groups'],
    queryFn: mockApi.getFeeGroups,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const usePublicFees = (type: 'deposit' | 'withdraw' | 'trading') => {
  return useQuery({
    queryKey: ['public', 'fees', type],
    queryFn: () => mockApi.getFees(type),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const usePublicTimestamp = () => {
  return useQuery({
    queryKey: ['public', 'timestamp'],
    queryFn: mockApi.getTimestamp,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { Market, mockMarkets } from '../mock-data';

// Markets API endpoints
const MARKETS_ENDPOINTS = {
  list: '/api/v2/peatio/public/markets',
  ticker: '/api/v2/peatio/public/markets/:id/ticker',
  orderBook: '/api/v2/peatio/public/markets/:id/order-book',
  trades: '/api/v2/peatio/public/markets/:id/trades',
} as const;

// Mock API functions
const mockApi = {
  getMarkets: async (): Promise<Market[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockMarkets;
  },
  
  getMarketTicker: async (marketId: string): Promise<Market['data']> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const market = mockMarkets.find(m => m.id === marketId);
    return market?.data || mockMarkets[0].data;
  },
  
  getOrderBook: async (marketId: string, limit: number = 20) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      asks: [
        ["43250.50", "0.5"],
        ["43251.00", "1.2"],
        ["43252.00", "0.8"],
        ["43253.00", "2.1"],
        ["43254.00", "1.5"],
      ].slice(0, limit),
      bids: [
        ["43249.50", "0.3"],
        ["43249.00", "0.9"],
        ["43248.00", "1.7"],
        ["43247.00", "0.6"],
        ["43246.00", "2.3"],
      ].slice(0, limit),
    };
  },
  
  getTrades: async (marketId: string, limit: number = 50) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return Array.from({ length: limit }, (_, i) => ({
      id: i + 1,
      price: (43250 + Math.random() * 100).toFixed(2),
      amount: (Math.random() * 2).toFixed(4),
      total: (43250 * Math.random() * 2).toFixed(2),
      fee_currency: "usdt",
      fee: (Math.random() * 10).toFixed(2),
      market: marketId,
      created_at: new Date(Date.now() - i * 60000).toISOString(),
      side: Math.random() > 0.5 ? 'buy' : 'sell' as const,
      order_id: Math.floor(Math.random() * 1000),
    }));
  },
};

// React Query hooks
export const useMarkets = () => {
  return useQuery({
    queryKey: ['markets'],
    queryFn: mockApi.getMarkets,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useMarketTicker = (marketId: string) => {
  return useQuery({
    queryKey: ['markets', marketId, 'ticker'],
    queryFn: () => mockApi.getMarketTicker(marketId),
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 5 * 1000, // Refetch every 5 seconds
    enabled: !!marketId,
  });
};

export const useOrderBook = (marketId: string, limit: number = 20) => {
  return useQuery({
    queryKey: ['markets', marketId, 'orderbook', limit],
    queryFn: () => mockApi.getOrderBook(marketId, limit),
    staleTime: 1 * 1000, // 1 second
    refetchInterval: 1 * 1000, // Refetch every second
    enabled: !!marketId,
  });
};

export const useTrades = (marketId: string, limit: number = 50) => {
  return useQuery({
    queryKey: ['markets', marketId, 'trades', limit],
    queryFn: () => mockApi.getTrades(marketId, limit),
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 5 * 1000, // Refetch every 5 seconds
    enabled: !!marketId,
  });
};

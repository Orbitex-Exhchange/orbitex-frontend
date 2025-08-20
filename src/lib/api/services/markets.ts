import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { Market, mockMarkets } from '../mock-data';

// Markets API endpoints - Updated to match our backend
const MARKETS_ENDPOINTS = {
  list: '/api/v2/markets',
  ticker: '/api/v2/markets/:id/ticker',
  orderBook: '/api/v2/markets/:id/orderbook',
  trades: '/api/v2/markets/:id/trades',
} as const;

// Real API functions - Connected to our backend
const realApi = {
  getMarkets: async (): Promise<any> => {
    const response = await apiClient.get(MARKETS_ENDPOINTS.list);
    return response.data.markets;
  },
  
  getMarketTicker: async (marketId: string): Promise<any> => {
    const url = MARKETS_ENDPOINTS.ticker.replace(':id', marketId);
    const response = await apiClient.get(url);
    return response.data;
  },
  
  getOrderBook: async (marketId: string, limit: number = 20) => {
    const url = MARKETS_ENDPOINTS.orderBook.replace(':id', marketId);
    const response = await apiClient.get(url);
    return response.data;
  },
  
  getTrades: async (marketId: string, limit: number = 50) => {
    const url = MARKETS_ENDPOINTS.trades.replace(':id', marketId);
    const response = await apiClient.get(url);
    return response.data.trades;
  },
};

// React Query hooks - Connected to real backend
export const useMarkets = () => {
  return useQuery({
    queryKey: ['markets'],
    queryFn: realApi.getMarkets,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useMarketTicker = (marketId: string) => {
  return useQuery({
    queryKey: ['markets', marketId, 'ticker'],
    queryFn: () => realApi.getMarketTicker(marketId),
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 5 * 1000, // Refetch every 5 seconds
    enabled: !!marketId,
  });
};

export const useOrderBook = (marketId: string, limit: number = 20) => {
  return useQuery({
    queryKey: ['markets', marketId, 'orderbook', limit],
    queryFn: () => realApi.getOrderBook(marketId, limit),
    staleTime: 1 * 1000, // 1 second
    refetchInterval: 1 * 1000, // Refetch every second
    enabled: !!marketId,
  });
};

export const useTrades = (marketId: string, limit: number = 50) => {
  return useQuery({
    queryKey: ['markets', marketId, 'trades', limit],
    queryFn: () => realApi.getTrades(marketId, limit),
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 5 * 1000, // Refetch every 5 seconds
    enabled: !!marketId,
  });
};

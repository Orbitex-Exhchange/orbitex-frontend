import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api-client';

// Markets API endpoints - Updated to match our backend
const MARKETS_ENDPOINTS = {
  list: '/api/v2/public/markets',
  ticker: '/api/v2/public/markets/:id/tickers',
  orderBook: '/api/v2/public/markets/:id/order-book',
  trades: '/api/v2/public/markets/:id/trades',
} as const;

// Real API functions - Connected to our backend
// Real API functions - Connected to our backend (Standalone to avoid TDZ)
export const getMarkets = async (): Promise<any> => {
  const response = await api.get(MARKETS_ENDPOINTS.list);
  return response;
};

export const getMarketTicker = async (marketId: string): Promise<any> => {
  const url = MARKETS_ENDPOINTS.ticker.replace(':id', marketId);
  const response = await api.get(url);
  return response;
};

export const getOrderBook = async (marketId: string, limit: number = 20) => {
  const url = `${MARKETS_ENDPOINTS.orderBook.replace(':id', marketId)}?asks_limit=${limit}&bids_limit=${limit}`;
  const response = await api.get(url);
  return response;
};

export const getTrades = async (marketId: string, limit: number = 50) => {
  const url = `${MARKETS_ENDPOINTS.trades.replace(':id', marketId)}?limit=${limit}`;
  const response = await api.get(url);
  return response;
};

// React Query hooks - Connected to real backend
// React Query hooks - Connected to real backend
export const useMarkets = () => {
  return useQuery({
    queryKey: ['markets'],
    queryFn: getMarkets,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useMarketTicker = (marketId: string) => {
  return useQuery({
    queryKey: ['markets', marketId, 'ticker'],
    queryFn: () => getMarketTicker(marketId),
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 5 * 1000, // Refetch every 5 seconds
    enabled: !!marketId,
  });
};

export const useOrderBook = (marketId: string, limit: number = 20) => {
  return useQuery({
    queryKey: ['markets', marketId, 'orderbook', limit],
    queryFn: () => getOrderBook(marketId, limit),
    staleTime: 1 * 1000, // 1 second
    refetchInterval: 1 * 1000, // Refetch every second
    enabled: !!marketId,
  });
};

export const useTrades = (marketId: string, limit: number = 50) => {
  return useQuery({
    queryKey: ['markets', marketId, 'trades', limit],
    queryFn: () => getTrades(marketId, limit),
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 5 * 1000, // Refetch every 5 seconds
    enabled: !!marketId,
  });
};

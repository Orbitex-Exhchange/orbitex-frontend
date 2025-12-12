import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import {
  V2Order,
  V2Trade,
  ApiResponse
} from '../types/api_v2';

// Market API endpoints - Updated to match V2 API structure
const MARKET_ENDPOINTS = {
  orders: '/api/api_v2/market/orders',
  order: '/api/api_v2/market/orders/:id',
  cancelOrder: '/api/api_v2/market/orders/:id/cancel',
  cancelAllOrders: '/api/api_v2/market/orders/cancel',
  trades: '/api/api_v2/market/trades',
  trade: '/api/api_v2/market/trades/:id',
} as const;

// Real V2 API functions - Standalone to avoid TDZ
export const getOrders = async (params?: {
  market?: string;
  state?: string;
  limit?: number;
  page?: number;
  order_by?: string;
}): Promise<V2Order[]> => {
  const response = await apiClient.get<V2Order[]>(MARKET_ENDPOINTS.orders, {
    params
  });
  return response.data;
};

export const getOrder = async (id: number): Promise<V2Order | null> => {
  try {
    const url = MARKET_ENDPOINTS.order.replace(':id', id.toString());
    const response = await apiClient.get<V2Order>(url);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const createOrder = async (data: {
  market: string;
  side: 'buy' | 'sell';
  volume: string;
  ord_type?: 'limit' | 'market';
  price?: string;
}): Promise<V2Order> => {
  const response = await apiClient.post<V2Order>(MARKET_ENDPOINTS.orders, data);
  return response.data;
};

export const cancelOrder = async (id: number): Promise<V2Order> => {
  const url = MARKET_ENDPOINTS.cancelOrder.replace(':id', id.toString());
  const response = await apiClient.post<V2Order>(url);
  return response.data;
};

export const cancelAllOrders = async (params?: {
  market?: string;
  side?: string;
}): Promise<V2Order[]> => {
  const response = await apiClient.post<V2Order[]>(MARKET_ENDPOINTS.cancelAllOrders, params);
  return response.data;
};

export const getTrades = async (params?: {
  market?: string;
  limit?: number;
  page?: number;
  order_by?: string;
}): Promise<V2Trade[]> => {
  const response = await apiClient.get<V2Trade[]>(MARKET_ENDPOINTS.trades, {
    params
  });
  return response.data;
};

export const getTrade = async (id: number): Promise<V2Trade | null> => {
  try {
    const url = MARKET_ENDPOINTS.trade.replace(':id', id.toString());
    const response = await apiClient.get<V2Trade>(url);
    return response.data;
  } catch (error) {
    return null;
  }
};

// React Query hooks
export const useMarketOrders = (params?: {
  market?: string;
  state?: string;
  limit?: number;
  page?: number;
  order_by?: string;
}) => {
  return useQuery({
    queryKey: ['market', 'orders', params],
    queryFn: () => getOrders(params),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds
  });
};

export const useMarketOrder = (id: number) => {
  return useQuery({
    queryKey: ['market', 'order', id],
    queryFn: () => getOrder(id),
    enabled: !!id,
    staleTime: 10 * 1000, // 10 seconds
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['account', 'balances'] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['account', 'balances'] });
    },
  });
};

export const useCancelAllOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelAllOrders,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['account', 'balances'] });
    },
  });
};

export const useMarketTrades = (params?: {
  market?: string;
  limit?: number;
  page?: number;
  order_by?: string;
}) => {
  return useQuery({
    queryKey: ['market', 'trades', params],
    queryFn: () => getTrades(params),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds
  });
};

export const useMarketTrade = (id: number) => {
  return useQuery({
    queryKey: ['market', 'trade', id],
    queryFn: () => getTrade(id),
    enabled: !!id,
    staleTime: 10 * 1000, // 10 seconds
  });
};

// Export the API functions for backward compatibility (Deprecated)
// Object export removed to prevent TDZ issues
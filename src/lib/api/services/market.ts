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
  cancelAllOrders: '/api/api_v2/market/orders_cancel',
  trades: '/api/api_v2/market/trades',
  trade: '/api/api_v2/market/trades/:id',
} as const;

// Real V2 API functions
const v2Api = {
  getOrders: async (params?: {
    market?: string;
    state?: string;
    limit?: number;
    page?: number;
    order_by?: string;
  }): Promise<V2Order[]> => {
    const response = await apiClient.get<ApiResponse<V2Order[]>>(MARKET_ENDPOINTS.orders, {
      params
    });
    return response.data.data;
  },

  getOrder: async (id: number): Promise<V2Order | null> => {
    try {
      const url = MARKET_ENDPOINTS.order.replace(':id', id.toString());
      const response = await apiClient.get<{ data: V2Order }>(url);
      return response.data.data;
    } catch (error) {
      return null;
    }
  },

  createOrder: async (data: {
    market: string;
    side: 'buy' | 'sell';
    volume: string;
    ord_type: 'limit' | 'market';
    price?: string;
    time_in_force?: string;
  }): Promise<V2Order> => {
    const response = await apiClient.post<{ data: V2Order }>(MARKET_ENDPOINTS.orders, data);
    return response.data.data;
  },

  cancelOrder: async (id: number): Promise<V2Order> => {
    const url = MARKET_ENDPOINTS.cancelOrder.replace(':id', id.toString());
    const response = await apiClient.post<{ data: V2Order }>(url);
    return response.data.data;
  },

  cancelAllOrders: async (params?: {
    market?: string;
  }): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(MARKET_ENDPOINTS.cancelAllOrders, params);
    return response.data;
  },

  getTrades: async (params?: {
    market?: string;
    limit?: number;
    page?: number;
    order_by?: string;
  }): Promise<V2Trade[]> => {
    const response = await apiClient.get<ApiResponse<V2Trade[]>>(MARKET_ENDPOINTS.trades, {
      params
    });
    return response.data.data;
  },

  getTrade: async (id: number): Promise<V2Trade | null> => {
    try {
      const url = MARKET_ENDPOINTS.trade.replace(':id', id.toString());
      const response = await apiClient.get<{ data: V2Trade }>(url);
      return response.data.data;
    } catch (error) {
      return null;
    }
  },
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
    queryFn: () => v2Api.getOrders(params),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds
  });
};

export const useMarketOrder = (id: number) => {
  return useQuery({
    queryKey: ['market', 'order', id],
    queryFn: () => v2Api.getOrder(id),
    enabled: !!id,
    staleTime: 10 * 1000, // 10 seconds
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: v2Api.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['account', 'balances'] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: v2Api.cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['account', 'balances'] });
    },
  });
};

export const useCancelAllOrders = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: v2Api.cancelAllOrders,
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
    queryFn: () => v2Api.getTrades(params),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds
  });
};

export const useMarketTrade = (id: number) => {
  return useQuery({
    queryKey: ['market', 'trade', id],
    queryFn: () => v2Api.getTrade(id),
    enabled: !!id,
    staleTime: 10 * 1000, // 10 seconds
  });
};
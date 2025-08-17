import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { Order, mockOrders } from '../mock-data';

// Orders API endpoints
const ORDERS_ENDPOINTS = {
  list: '/api/v2/peatio/market/orders',
  create: '/api/v2/peatio/market/orders',
  cancel: '/api/v2/peatio/market/orders/:id/cancel',
  get: '/api/v2/peatio/market/orders/:id',
} as const;

// Mock API functions
const mockApi = {
  getOrders: async (market?: string): Promise<Order[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (market) {
      return mockOrders.filter(order => order.market === market);
    }
    return mockOrders;
  },
  
  getOrder: async (id: number): Promise<Order | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockOrders.find(order => order.id === id) || null;
  },
  
  createOrder: async (orderData: {
    market: string;
    side: 'buy' | 'sell';
    ord_type: 'limit' | 'market';
    price?: string;
    volume: string;
  }): Promise<Order> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newOrder: Order = {
      id: Date.now(),
      uuid: `order-${Date.now()}`,
      side: orderData.side,
      ord_type: orderData.ord_type,
      price: orderData.price || '0',
      avg_price: orderData.price || '0',
      state: 'wait',
      market: orderData.market,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      origin_volume: orderData.volume,
      remaining_volume: orderData.volume,
      executed_volume: '0',
      trades_count: 0,
      trades: [],
    };
    return newOrder;
  },
  
  cancelOrder: async (id: number): Promise<Order> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const order = mockOrders.find(o => o.id === id);
    if (!order) {
      throw new Error('Order not found');
    }
    return { ...order, state: 'cancel' };
  },
};

// React Query hooks
export const useOrders = (market?: string) => {
  return useQuery({
    queryKey: ['orders', market],
    queryFn: () => mockApi.getOrders(market),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds
  });
};

export const useOrder = (id: number) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => mockApi.getOrder(id),
    staleTime: 10 * 1000, // 10 seconds
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockApi.createOrder,
    onSuccess: (newOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['markets'] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockApi.cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
};

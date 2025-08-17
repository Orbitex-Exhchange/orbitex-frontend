import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { 
  MarketOrder, 
  MarketTrade,
  mockMarketOrders,
  mockMarketTrades
} from '../mock-data/enhanced';

// Market API endpoints
const MARKET_ENDPOINTS = {
  orders: '/api/v2/peatio/market/orders',
  trades: '/api/v2/peatio/market/trades',
} as const;

// Mock API functions
const mockApi = {
  getOrders: async (params?: {
    market?: string;
    state?: string;
    limit?: number;
    page?: number;
  }): Promise<MarketOrder[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    let orders = mockMarketOrders;
    
    if (params?.market) {
      orders = orders.filter(o => o.market === params.market);
    }
    
    if (params?.state) {
      orders = orders.filter(o => o.state === params.state);
    }
    
    return orders;
  },

  getOrder: async (id: number): Promise<MarketOrder | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockMarketOrders.find(o => o.id === id) || null;
  },

  createOrder: async (data: {
    market: string;
    side: 'buy' | 'sell';
    volume: string;
    ord_type: 'limit' | 'market' | 'stop' | 'stop_limit';
    price?: string;
    stop_price?: string;
  }): Promise<MarketOrder> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newOrder: MarketOrder = {
      id: Date.now(),
      uuid: `order_${Date.now()}`,
      side: data.side,
      ord_type: data.ord_type,
      price: data.price || "0",
      avg_price: data.price || "0",
      state: 'wait',
      market: data.market,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      origin_volume: data.volume,
      remaining_volume: data.volume,
      executed_volume: "0",
      trades_count: 0,
      trades: [],
    };

    return newOrder;
  },

  cancelOrder: async (id: number): Promise<MarketOrder> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const order = mockMarketOrders.find(o => o.id === id);
    if (!order) {
      throw new Error('Order not found');
    }

    return { ...order, state: 'cancel', updated_at: new Date().toISOString() };
  },

  cancelAllOrders: async (params?: {
    market?: string;
    side?: 'buy' | 'sell';
  }): Promise<{ message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { message: 'All orders cancelled successfully' };
  },

  getTrades: async (params?: {
    market?: string;
    limit?: number;
    page?: number;
  }): Promise<MarketTrade[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    let trades = mockMarketTrades;
    
    if (params?.market) {
      trades = trades.filter(t => t.market === params.market);
    }
    
    return trades;
  },

  getTrade: async (id: number): Promise<MarketTrade | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockMarketTrades.find(t => t.id === id) || null;
  },
};

// React Query hooks
export const useMarketOrders = (params?: {
  market?: string;
  state?: string;
  limit?: number;
  page?: number;
}) => {
  return useQuery({
    queryKey: ['market', 'orders', params],
    queryFn: () => mockApi.getOrders(params),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds
  });
};

export const useMarketOrder = (id: number) => {
  return useQuery({
    queryKey: ['market', 'order', id],
    queryFn: () => mockApi.getOrder(id),
    enabled: !!id,
    staleTime: 10 * 1000, // 10 seconds
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockApi.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['account', 'balances'] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockApi.cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['account', 'balances'] });
    },
  });
};

export const useCancelAllOrders = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockApi.cancelAllOrders,
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
}) => {
  return useQuery({
    queryKey: ['market', 'trades', params],
    queryFn: () => mockApi.getTrades(params),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds
  });
};

export const useMarketTrade = (id: number) => {
  return useQuery({
    queryKey: ['market', 'trade', id],
    queryFn: () => mockApi.getTrade(id),
    enabled: !!id,
    staleTime: 10 * 1000, // 10 seconds
  });
};

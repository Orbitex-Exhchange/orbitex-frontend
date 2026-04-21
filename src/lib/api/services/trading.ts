import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { throttle, memoize, performanceMonitor } from '../performance';
import { useMarketWebSocket } from '../websocket';

// Trading API endpoints
const TRADING_ENDPOINTS = {
  // Order management
  orders: '/api/api_v2/market/orders',
  order: '/api/api_v2/market/orders/:id',
  cancelOrder: '/api/api_v2/market/orders/:id/cancel',
  cancelAllOrders: '/api/api_v2/market/orders_cancel',

  // Trade history
  trades: '/api/api_v2/market/trades',
  trade: '/api/api_v2/market/trades/:id',

  // Market data (real-time)
  ticker: '/api/api_v2/public/markets/:market/tickers/',
  orderbook: '/api/api_v2/public/markets/:market/order-book',
  marketTrades: '/api/api_v2/public/markets/:market/trades',
  kline: '/api/api_v2/public/markets/:market/k-line'
} as const;

const KLINE_PERIOD_MAP: Record<string, number> = {
  '1m': 1,
  '5m': 5,
  '15m': 15,
  '30m': 30,
  '1h': 60,
  '2h': 120,
  '4h': 240,
  '6h': 360,
  '12h': 720,
  '1d': 1440,
  '3d': 4320,
  '1w': 10080,
};

export const normalizeMarketSymbol = (market: string): string =>
  market.replace(/[-_/]/g, '').toLowerCase();

const resolveKlinePeriod = (period: string): number => KLINE_PERIOD_MAP[period] || 60;

// Types for trading API responses
export interface Order {
  id: number;
  market: string;
  side: 'buy' | 'sell';
  ord_type: 'limit' | 'market' | 'stop_limit';
  price: string;
  volume: string;
  remaining_volume: string;
  executed_volume: string;
  trades_count: number;
  state: 'wait' | 'done' | 'cancel' | 'reject';
  created_at: string;
  updated_at: string;
  avg_price?: string;
  trades?: Trade[];
}

export interface Trade {
  id: number;
  market: string;
  side: 'buy' | 'sell';
  price: string;
  volume: string;
  amount: string;
  fee: string;
  created_at: string;
  createdAt: string;
  maker_order_id: number;
  taker_order_id: number;
}

export interface Ticker {
  market: string;
  at: number;
  ticker: {
    buy: string;
    sell: string;
    low: string;
    high: string;
    last: string;
    vol: string;
    amount: string;
    price_change_percent: string;
  };
}

export interface OrderBook {
  market: string;
  at: number;
  asks: [string, string][];
  bids: [string, string][];
}

export interface Kline {
  market: string;
  period: string;
  at: number;
  k_line: {
    time: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
  }[];
}

export interface CreateOrderRequest {
  market: string;
  side: 'buy' | 'sell';
  volume: string;
  ord_type: 'limit' | 'market';
  price?: string;
  time_in_force?: 'GTC' | 'IOC' | 'FOK';
}

// Trading API functions - Standalone (No ObjectWrapper to avoid TDZ)
const unwrapData = <T>(payload: T | { data?: T }): T =>
  ((payload as { data?: T })?.data ?? payload) as T;

// Order management
export const getOrders = async (params?: {
  market?: string;
  state?: string;
  limit?: number;
  page?: number;
  order_by?: string;
}): Promise<Order[]> => {
  const response = await apiClient.get<any>(TRADING_ENDPOINTS.orders, {
    params
  });
  return unwrapData(response.data) || [];
};

export const getOrder = async (id: number): Promise<Order | null> => {
  try {
    const url = TRADING_ENDPOINTS.order.replace(':id', id.toString());
    const response = await apiClient.get<Order | { data: Order }>(url);
    return unwrapData(response.data);
  } catch (error) {
    return null;
  }
};

export const createOrder = async (data: CreateOrderRequest): Promise<Order> => {
  const response = await apiClient.post<Order | { data: Order }>(TRADING_ENDPOINTS.orders, data);
  return unwrapData(response.data);
};

export const cancelOrder = async (id: number): Promise<Order> => {
  const url = TRADING_ENDPOINTS.cancelOrder.replace(':id', id.toString());
  const response = await apiClient.post<Order | { data: Order }>(url);
  return unwrapData(response.data);
};

export const cancelAllOrders = async (params?: {
  market?: string;
}): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(TRADING_ENDPOINTS.cancelAllOrders, params);
  return response.data;
};

// Trade history
export const getTrades = async (params?: {
  market?: string;
  limit?: number;
  page?: number;
  order_by?: string;
}): Promise<Trade[]> => {
  const response = await apiClient.get<any>(TRADING_ENDPOINTS.trades, {
    params
  });
  return unwrapData(response.data) || [];
};

export const getTrade = async (id: number): Promise<Trade | null> => {
  try {
    const url = TRADING_ENDPOINTS.trade.replace(':id', id.toString());
    const response = await apiClient.get<Trade | { data: Trade }>(url);
    return unwrapData(response.data);
  } catch (error) {
    return null;
  }
};

// Market data
export const getTicker = async (market: string): Promise<Ticker> => {
  const symbol = normalizeMarketSymbol(market);
  const url = TRADING_ENDPOINTS.ticker.replace(':market', symbol);
  const response = await apiClient.get<Ticker>(url);
  // Handle wrapper if present
  // Handle wrapper if present
  return (response.data as any)?.ticker ? response.data : ((response.data as any)?.data || response.data);
};

export const getOrderBook = async (market: string, limit?: number): Promise<OrderBook> => {
  const symbol = normalizeMarketSymbol(market);
  const url = TRADING_ENDPOINTS.orderbook.replace(':market', symbol);
  const response = await apiClient.get<OrderBook>(url, {
    params: limit ? { limit } : undefined
  });
  // Handle wrapper if present
  // Handle wrapper if present
  return (response.data as any)?.asks ? response.data : ((response.data as any)?.data || { asks: [], bids: [], market: market, at: Date.now() });
};

export const getMarketTrades = async (market: string, limit?: number): Promise<Trade[]> => {
  const symbol = normalizeMarketSymbol(market);
  const url = TRADING_ENDPOINTS.marketTrades.replace(':market', symbol);
  const response = await apiClient.get<Trade[] | { data: Trade[] }>(url, {
    params: limit ? { limit } : undefined
  });
  return unwrapData(response.data) || [];
};

export const getKline = async (market: string, period: string = '1m', limit?: number): Promise<Kline> => {
  const symbol = normalizeMarketSymbol(market);
  const url = TRADING_ENDPOINTS.kline.replace(':market', symbol);
  const response = await apiClient.get<Kline>(url, {
    params: { period: resolveKlinePeriod(period), ...(limit && { limit }) }
  });
  // Handle wrapper if present
  // Handle wrapper if present
  return (response.data as any)?.k_line ? response.data : ((response.data as any)?.data || response.data);
};

// Performance-optimized React Query hooks for trading
export const useOrders = (params?: {
  market?: string;
  state?: string;
  limit?: number;
  page?: number;
  order_by?: string;
}) => {
  return useQuery({
    queryKey: ['trading', 'orders', params],
    queryFn: () => {
      const endTiming = performanceMonitor.startTiming('getOrders');
      return getOrders(params).finally(endTiming);
    },
    staleTime: 2 * 1000, // 2 seconds for high-frequency trading
    refetchInterval: 2 * 1000, // Refetch every 2 seconds
    refetchIntervalInBackground: true,
  });
};

export const useOrder = (id: number) => {
  return useQuery({
    queryKey: ['trading', 'order', id],
    queryFn: () => getOrder(id),
    enabled: !!id,
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 5 * 1000, // Refetch every 5 seconds
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trading', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['account', 'balances'] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trading', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['account', 'balances'] });
    },
  });
};

export const useCancelAllOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelAllOrders,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trading', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['account', 'balances'] });
    },
  });
};

export const useTrades = (params?: {
  market?: string;
  limit?: number;
  page?: number;
  order_by?: string;
}) => {
  return useQuery({
    queryKey: ['trading', 'trades', params],
    queryFn: () => getTrades(params),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds
  });
};

export const useTrade = (id: number) => {
  return useQuery({
    queryKey: ['trading', 'trade', id],
    queryFn: () => getTrade(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Real-time market data hooks with WebSocket integration
export const useTicker = (market: string) => {
  const { ticker: wsTicker } = useMarketWebSocket(market);

  const queryResult = useQuery({
    queryKey: ['trading', 'ticker', market],
    queryFn: () => {
      const endTiming = performanceMonitor.startTiming('getTicker');
      return getTicker(market).finally(endTiming);
    },
    enabled: !!market,
    staleTime: 1 * 1000, // 1 second for real-time data
    refetchInterval: 5 * 1000, // Fallback refetch every 5 seconds
    refetchIntervalInBackground: true,
  });

  // Use WebSocket data if available, otherwise fallback to query data
  return {
    ...queryResult,
    data: wsTicker || queryResult.data,
  };
};

export const useOrderBook = (market: string, limit?: number) => {
  const { orderbook: wsOrderBook } = useMarketWebSocket(market);

  const queryResult = useQuery({
    queryKey: ['trading', 'orderbook', market, limit],
    queryFn: () => {
      const endTiming = performanceMonitor.startTiming('getOrderBook');
      return getOrderBook(market, limit).finally(endTiming);
    },
    enabled: !!market,
    staleTime: 1 * 1000, // 1 second for real-time data
    refetchInterval: 5 * 1000, // Fallback refetch every 5 seconds
    refetchIntervalInBackground: true,
  });

  return {
    ...queryResult,
    data: wsOrderBook || queryResult.data,
  };
};

export const useMarketTrades = (market: string, limit?: number) => {
  const { trades: wsTrades } = useMarketWebSocket(market);

  const queryResult = useQuery({
    queryKey: ['trading', 'market_trades', market, limit],
    queryFn: () => {
      const endTiming = performanceMonitor.startTiming('getMarketTrades');
      return getMarketTrades(market, limit).finally(endTiming);
    },
    enabled: !!market,
    staleTime: 2 * 1000, // 2 seconds
    refetchInterval: 5 * 1000, // Fallback refetch every 5 seconds
    refetchIntervalInBackground: true,
  });

  return {
    ...queryResult,
    data: wsTrades || queryResult.data,
  };
};

export const useKline = (market: string, period: string = '1m', limit?: number) => {
  return useQuery({
    queryKey: ['trading', 'kline', market, period, limit],
    queryFn: () => getKline(market, period, limit),
    enabled: !!market,
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 5 * 1000, // Refetch every 5 seconds
  });
};

// Performance-optimized utility functions
export const calculateOrderValue = memoize((price: string, volume: string): string => {
  return (parseFloat(price) * parseFloat(volume)).toString();
});

export const calculateOrderFee = memoize((value: string, feeRate: string): string => {
  return (parseFloat(value) * parseFloat(feeRate)).toString();
});

export const formatOrderSide = (side: 'buy' | 'sell'): string => {
  return side === 'buy' ? 'Buy' : 'Sell';
};

export const formatOrderType = (type: string): string => {
  switch (type) {
    case 'limit': return 'Limit';
    case 'market': return 'Market';
    case 'stop_limit': return 'Stop Limit';
    default: return type;
  }
};

export const formatOrderState = (state: string): string => {
  switch (state) {
    case 'wait': return 'Pending';
    case 'done': return 'Filled';
    case 'cancel': return 'Cancelled';
    case 'reject': return 'Rejected';
    default: return state;
  }
};

export const getOrderStateColor = (state: string): string => {
  switch (state) {
    case 'wait': return 'text-yellow-600';
    case 'done': return 'text-green-600';
    case 'cancel': return 'text-gray-600';
    case 'reject': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

export const getOrderSideColor = (side: 'buy' | 'sell'): string => {
  return side === 'buy' ? 'text-green-600' : 'text-red-600';
};

// Export the API functions for direct use (Backward compatibility)
// Object export removed to prevent TDZ issues

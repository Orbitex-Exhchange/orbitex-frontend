import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import {
  V2Market,
  V2Currency,
  V2Ticker,
  V2OrderBook,
  V2Trade,
  V2KLine,
  V2MemberLevel,
  V2TradingFee,
  V2WithdrawLimit,
  ApiResponse
} from '../types/v2';

// Public API endpoints - Updated to match V2 API structure
const PUBLIC_ENDPOINTS = {
  markets: '/api/v2/public/markets',
  currencies: '/api/v2/public/currencies',
  tickers: '/api/v2/public/tickers',
  ticker: '/api/v2/public/tickers/:market',
  orderBook: '/api/v2/public/order_book/:market',
  trades: '/api/v2/public/trades/:market',
  kLines: '/api/v2/public/k/:market',
  kWithPendingTrades: '/api/v2/public/k_with_pending_trades/:market',
  depth: '/api/v2/public/depth/:market',
  memberLevels: '/api/v2/public/member_levels',
  tradingFees: '/api/v2/public/trading_fees',
  withdrawLimits: '/api/v2/public/withdraw_limits',
  webhooks: '/api/v2/public/webhooks',
  timestamp: '/api/v2/public/timestamp',
  time: '/api/v2/public/time',
} as const;

// Real V2 API functions
const v2Api = {
  getMarkets: async (): Promise<V2Market[]> => {
    const response = await apiClient.get<ApiResponse<V2Market[]>>(PUBLIC_ENDPOINTS.markets);
    return response.data.data;
  },

  getMarket: async (id: string): Promise<V2Market | null> => {
    try {
      const response = await apiClient.get<V2Market>(`${PUBLIC_ENDPOINTS.markets}/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  getCurrencies: async (): Promise<V2Currency[]> => {
    const response = await apiClient.get<ApiResponse<V2Currency[]>>(PUBLIC_ENDPOINTS.currencies);
    return response.data.data;
  },

  getCurrency: async (id: string): Promise<V2Currency | null> => {
    try {
      const response = await apiClient.get<V2Currency>(`${PUBLIC_ENDPOINTS.currencies}/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  getTickers: async (): Promise<{ market: string; ticker: V2Ticker }[]> => {
    const response = await apiClient.get<ApiResponse<{ market: string; ticker: V2Ticker }[]>>(PUBLIC_ENDPOINTS.tickers);
    return response.data.data;
  },

  getTicker: async (market: string): Promise<{ market: string; ticker: V2Ticker } | null> => {
    try {
      const url = PUBLIC_ENDPOINTS.ticker.replace(':market', market);
      const response = await apiClient.get<{ market: string; ticker: V2Ticker }>(url);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  getOrderBook: async (market: string, asksLimit: number = 20, bidsLimit: number = 20): Promise<V2OrderBook> => {
    const url = PUBLIC_ENDPOINTS.orderBook.replace(':market', market);
    const response = await apiClient.get<V2OrderBook>(url, {
      params: { asks_limit: asksLimit, bids_limit: bidsLimit }
    });
    return response.data;
  },

  getTrades: async (market: string, limit: number = 50): Promise<V2Trade[]> => {
    const url = PUBLIC_ENDPOINTS.trades.replace(':market', market);
    const response = await apiClient.get<ApiResponse<V2Trade[]>>(url, {
      params: { limit }
    });
    return response.data.data;
  },

  getKLines: async (market: string, period: number, timeFrom?: number, timeTo?: number, limit: number = 30): Promise<V2KLine[]> => {
    const url = PUBLIC_ENDPOINTS.kLines.replace(':market', market);
    const params: any = { period, limit };
    if (timeFrom) params.time_from = timeFrom;
    if (timeTo) params.time_to = timeTo;
    
    const response = await apiClient.get<{ market: string; period: number; data: V2KLine[] }>(url, { params });
    return response.data.data;
  },

  getKWithPendingTrades: async (market: string, period: number, timeFrom?: number, timeTo?: number, limit: number = 30): Promise<{ data: V2KLine[]; trades: V2Trade[] }> => {
    const url = PUBLIC_ENDPOINTS.kWithPendingTrades.replace(':market', market);
    const params: any = { period, limit };
    if (timeFrom) params.time_from = timeFrom;
    if (timeTo) params.time_to = timeTo;
    
    const response = await apiClient.get<{ market: string; period: number; data: V2KLine[]; trades: V2Trade[] }>(url, { params });
    return { data: response.data.data, trades: response.data.trades };
  },

  getDepth: async (market: string, limit: number = 300): Promise<{ market: string; asks: [string, string][]; bids: [string, string][] }> => {
    const url = PUBLIC_ENDPOINTS.depth.replace(':market', market);
    const response = await apiClient.get<{ market: string; asks: [string, string][]; bids: [string, string][] }>(url, {
      params: { limit }
    });
    return response.data;
  },

  getMemberLevels: async (): Promise<V2MemberLevel[]> => {
    const response = await apiClient.get<ApiResponse<V2MemberLevel[]>>(PUBLIC_ENDPOINTS.memberLevels);
    return response.data.data;
  },

  getTradingFees: async (): Promise<V2TradingFee[]> => {
    const response = await apiClient.get<ApiResponse<V2TradingFee[]>>(PUBLIC_ENDPOINTS.tradingFees);
    return response.data.data;
  },

  getWithdrawLimits: async (): Promise<V2WithdrawLimit[]> => {
    const response = await apiClient.get<ApiResponse<V2WithdrawLimit[]>>(PUBLIC_ENDPOINTS.withdrawLimits);
    return response.data.data;
  },

  getWebhooks: async (): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>(PUBLIC_ENDPOINTS.webhooks);
    return response.data.data;
  },

  getTimestamp: async (): Promise<number> => {
    const response = await apiClient.get<{ data: number }>(PUBLIC_ENDPOINTS.timestamp);
    return response.data.data;
  },

  getTime: async (): Promise<string> => {
    const response = await apiClient.get<{ data: string }>(PUBLIC_ENDPOINTS.time);
    return response.data.data;
  },
};

// React Query hooks
export const usePublicMarkets = () => {
  return useQuery({
    queryKey: ['public', 'markets'],
    queryFn: v2Api.getMarkets,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePublicMarket = (id: string) => {
  return useQuery({
    queryKey: ['public', 'market', id],
    queryFn: () => v2Api.getMarket(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePublicCurrencies = () => {
  return useQuery({
    queryKey: ['public', 'currencies'],
    queryFn: v2Api.getCurrencies,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePublicCurrency = (id: string) => {
  return useQuery({
    queryKey: ['public', 'currency', id],
    queryFn: () => v2Api.getCurrency(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePublicTickers = () => {
  return useQuery({
    queryKey: ['public', 'tickers'],
    queryFn: v2Api.getTickers,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds
  });
};

export const usePublicTicker = (market: string) => {
  return useQuery({
    queryKey: ['public', 'ticker', market],
    queryFn: () => v2Api.getTicker(market),
    enabled: !!market,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds
  });
};

export const usePublicOrderBook = (market: string, asksLimit?: number, bidsLimit?: number) => {
  return useQuery({
    queryKey: ['public', 'orderbook', market, asksLimit, bidsLimit],
    queryFn: () => v2Api.getOrderBook(market, asksLimit, bidsLimit),
    enabled: !!market,
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 5 * 1000, // Refetch every 5 seconds
  });
};

export const usePublicTrades = (market: string, limit?: number) => {
  return useQuery({
    queryKey: ['public', 'trades', market, limit],
    queryFn: () => v2Api.getTrades(market, limit),
    enabled: !!market,
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 5 * 1000, // Refetch every 5 seconds
  });
};

export const usePublicKLines = (
  market: string, 
  period: number, 
  timeFrom?: number, 
  timeTo?: number, 
  limit?: number
) => {
  return useQuery({
    queryKey: ['public', 'klines', market, period, timeFrom, timeTo, limit],
    queryFn: () => v2Api.getKLines(market, period, timeFrom, timeTo, limit),
    enabled: !!market,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const usePublicKWithPendingTrades = (
  market: string, 
  period: number, 
  timeFrom?: number, 
  timeTo?: number, 
  limit?: number
) => {
  return useQuery({
    queryKey: ['public', 'k_with_pending_trades', market, period, timeFrom, timeTo, limit],
    queryFn: () => v2Api.getKWithPendingTrades(market, period, timeFrom, timeTo, limit),
    enabled: !!market,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const usePublicDepth = (market: string, limit?: number) => {
  return useQuery({
    queryKey: ['public', 'depth', market, limit],
    queryFn: () => v2Api.getDepth(market, limit),
    enabled: !!market,
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 5 * 1000, // Refetch every 5 seconds
  });
};

export const usePublicMemberLevels = () => {
  return useQuery({
    queryKey: ['public', 'member_levels'],
    queryFn: v2Api.getMemberLevels,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const usePublicTradingFees = () => {
  return useQuery({
    queryKey: ['public', 'trading_fees'],
    queryFn: v2Api.getTradingFees,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const usePublicWithdrawLimits = () => {
  return useQuery({
    queryKey: ['public', 'withdraw_limits'],
    queryFn: v2Api.getWithdrawLimits,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const usePublicWebhooks = () => {
  return useQuery({
    queryKey: ['public', 'webhooks'],
    queryFn: v2Api.getWebhooks,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const usePublicTimestamp = () => {
  return useQuery({
    queryKey: ['public', 'timestamp'],
    queryFn: v2Api.getTimestamp,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const usePublicTime = () => {
  return useQuery({
    queryKey: ['public', 'time'],
    queryFn: v2Api.getTime,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};
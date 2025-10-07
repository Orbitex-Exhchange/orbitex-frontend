import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import { env } from '../../env';

// Public API endpoints - No authentication required
const PUBLIC_ENDPOINTS = {
  // Market data
  markets: '/api/api_v2/public/markets',
  currencies: '/api/api_v2/public/currencies',
  tradingFees: '/api/api_v2/public/trading_fees',
  memberLevels: '/api/api_v2/public/member_levels',
  withdrawLimits: '/api/api_v2/public/withdraw_limits',
  
  // Tools
  timestamp: '/api/api_v2/public/timestamp',
  version: '/api/api_v2/public/version',
  health: '/api/api_v2/public/health',
} as const;

// Types for public API responses
export interface PublicMarket {
  id: string;
  name: string;
  base_unit: string;
  quote_unit: string;
  base_currency: string;
  quote_currency: string;
  amount_precision: number;
  price_precision: number;
  min_amount: string;
  min_price: string;
  max_price: string;
  state: string;
  position: number;
  data: any;
  engine_id: string;
  created_at: string;
  updated_at: string;
}

export interface PublicCurrency {
  id: string;
  code: string;
  name: string;
  type: string;
  precision: number;
  position: number;
  visible: boolean;
  deposit_enabled: boolean;
  withdraw_enabled: boolean;
  min_deposit_amount: string;
  min_withdraw_amount: string;
  withdraw_fee: string;
  min_confirmations: number;
  created_at: string;
  updated_at: string;
}

export interface TradingFee {
  group: string;
  market_id: string;
  maker: string;
  taker: string;
  created_at: string;
  updated_at: string;
}

export interface MemberLevel {
  id: number;
  level: number;
  group: string;
  deposit_limit: string;
  withdraw_limit: string;
  trading_limit: string;
  created_at: string;
  updated_at: string;
}

export interface WithdrawLimit {
  id: number;
  group: string;
  kyc_level: number;
  limit_24_hour: string;
  limit_1_month: string;
  created_at: string;
  updated_at: string;
}

export interface VersionInfo {
  git_tag: string;
  git_sha: string;
  build_date: string;
  version: string;
}

// Public API functions
const publicApi = {
  // Market data
  getMarkets: async (): Promise<PublicMarket[]> => {
    const response = await apiClient.get<PublicMarket[]>(PUBLIC_ENDPOINTS.markets);
    return response.data;
  },

  getCurrencies: async (): Promise<PublicCurrency[]> => {
    const response = await apiClient.get<{ data: PublicCurrency[] }>(PUBLIC_ENDPOINTS.currencies);
    return response.data.data;
  },

  getTradingFees: async (): Promise<TradingFee[]> => {
    const response = await apiClient.get<{ data: TradingFee[] }>(PUBLIC_ENDPOINTS.tradingFees);
    return response.data.data;
  },

  getMemberLevels: async (): Promise<MemberLevel[]> => {
    const response = await apiClient.get<{ data: MemberLevel[] }>(PUBLIC_ENDPOINTS.memberLevels);
    return response.data.data;
  },

  getWithdrawLimits: async (): Promise<WithdrawLimit[]> => {
    const response = await apiClient.get<{ data: WithdrawLimit[] }>(PUBLIC_ENDPOINTS.withdrawLimits);
    return response.data.data;
  },

  // Tools
  getTimestamp: async (): Promise<string> => {
    const response = await apiClient.get<string>(PUBLIC_ENDPOINTS.timestamp);
    return response.data;
  },

  getVersion: async (): Promise<VersionInfo> => {
    const response = await apiClient.get<{ data: VersionInfo }>(PUBLIC_ENDPOINTS.version);
    return response.data.data;
  },

  getHealth: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await apiClient.get<{ status: string; timestamp: string }>(PUBLIC_ENDPOINTS.health);
    return response.data;
  },

  getTickers: async (): Promise<any[]> => {
    const response = await apiClient.get<any>('/api/api_v2/public/markets/tickers');
    // The API returns a hash of market_id -> ticker_data, convert to array
    const tickersHash = response.data;
    if (typeof tickersHash === 'object' && tickersHash !== null) {
      return Object.entries(tickersHash).map(([market, ticker]) => ({
        market,
        ticker
      }));
    }
    return [];
  },
};

// React Query hooks for public data
export const usePublicMarkets = () => {
  return useQuery({
    queryKey: ['public', 'markets'],
    queryFn: publicApi.getMarkets,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const usePublicCurrencies = () => {
  return useQuery({
    queryKey: ['public', 'currencies'],
    queryFn: publicApi.getCurrencies,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

export const useTradingFees = () => {
  return useQuery({
    queryKey: ['public', 'trading_fees'],
    queryFn: publicApi.getTradingFees,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useMemberLevels = () => {
  return useQuery({
    queryKey: ['public', 'member_levels'],
    queryFn: publicApi.getMemberLevels,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useWithdrawLimits = () => {
  return useQuery({
    queryKey: ['public', 'withdraw_limits'],
    queryFn: publicApi.getWithdrawLimits,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useServerTimestamp = () => {
  return useQuery({
    queryKey: ['public', 'timestamp'],
    queryFn: publicApi.getTimestamp,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useServerVersion = () => {
  return useQuery({
    queryKey: ['public', 'version'],
    queryFn: publicApi.getVersion,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useServerHealth = () => {
  return useQuery({
    queryKey: ['public', 'health'],
    queryFn: publicApi.getHealth,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const usePublicTickers = () => {
  return useQuery({
    queryKey: ['public', 'tickers'],
    queryFn: publicApi.getTickers,
    staleTime: 1 * 1000, // 1 second for real-time data
    refetchInterval: 5 * 1000, // Refetch every 5 seconds
  });
};

// Utility functions
export const getMarketBySymbol = (markets: PublicMarket[], symbol: string): PublicMarket | undefined => {
  return markets.find(market => market.id === symbol || `${market.base_unit}${market.quote_unit}` === symbol);
};

export const getCurrencyByCode = (currencies: PublicCurrency[], code: string): PublicCurrency | undefined => {
  return currencies.find(currency => currency.code.toLowerCase() === code.toLowerCase());
};

export const getTradingFeeForMarket = (fees: TradingFee[], marketId: string, group: string = 'default'): TradingFee | undefined => {
  return fees.find(fee => fee.market_id === marketId && fee.group === group);
};

export const getWithdrawLimitForLevel = (limits: WithdrawLimit[], kycLevel: number, group: string = 'default'): WithdrawLimit | undefined => {
  return limits.find(limit => limit.kyc_level === kycLevel && limit.group === group);
};

// Export the API functions for direct use
export { publicApi };
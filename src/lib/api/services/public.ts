import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import {
  BACKEND_RUST_ENDPOINTS,
  normalizeBackendMarkets,
  normalizeBackendTickerMap,
  normalizeBackendTickers,
  normalizeBackendArray,
  unwrapBackendData,
} from '../backend-rust';

// Public API endpoints - No authentication required
const PUBLIC_ENDPOINTS = {
  // Market data
  markets: BACKEND_RUST_ENDPOINTS.public.markets,
  currencies: BACKEND_RUST_ENDPOINTS.public.currencies,
  tradingFees: BACKEND_RUST_ENDPOINTS.public.tradingFees,
  memberLevels: BACKEND_RUST_ENDPOINTS.public.memberLevels,
  withdrawLimits: BACKEND_RUST_ENDPOINTS.public.withdrawLimits,

  // Tools
  timestamp: BACKEND_RUST_ENDPOINTS.public.timestamp,
  version: BACKEND_RUST_ENDPOINTS.public.version,
  health: BACKEND_RUST_ENDPOINTS.health,
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

// Public API functions - Standalone (No ObjectWrapper to avoid TDZ)
export const getMarkets = async (): Promise<PublicMarket[]> => {
  const response = await apiClient.get<PublicMarket[]>(PUBLIC_ENDPOINTS.markets);
  return normalizeBackendMarkets(response.data) as PublicMarket[];
};

export const getCurrencies = async (): Promise<PublicCurrency[]> => {
  const response = await apiClient.get<{ data: PublicCurrency[] }>(PUBLIC_ENDPOINTS.currencies);
  return normalizeBackendArray<PublicCurrency>(response.data, 'currencies');
};

export const getTradingFees = async (): Promise<TradingFee[]> => {
  const response = await apiClient.get<{ data: TradingFee[] }>(PUBLIC_ENDPOINTS.tradingFees);
  return normalizeBackendArray<TradingFee>(response.data, 'trading_fees');
};

export const getMemberLevels = async (): Promise<MemberLevel[]> => {
  const response = await apiClient.get<{ data: MemberLevel[] }>(PUBLIC_ENDPOINTS.memberLevels);
  return normalizeBackendArray<MemberLevel>(response.data, 'member_levels');
};

export const getWithdrawLimits = async (): Promise<WithdrawLimit[]> => {
  const response = await apiClient.get<{ data: WithdrawLimit[] }>(PUBLIC_ENDPOINTS.withdrawLimits);
  return normalizeBackendArray<WithdrawLimit>(response.data, 'withdraw_limits');
};

// Tools
export const getTimestamp = async (): Promise<string> => {
  const response = await apiClient.get<string | { timestamp: string | number }>(PUBLIC_ENDPOINTS.timestamp);
  const payload = unwrapBackendData<any>(response.data);
  return String(payload?.timestamp ?? payload);
};

export const getVersion = async (): Promise<VersionInfo> => {
  const response = await apiClient.get<{ data: VersionInfo }>(PUBLIC_ENDPOINTS.version);
  return unwrapBackendData(response.data);
};

export const getHealth = async (): Promise<{ status: string; timestamp: string }> => {
  const response = await apiClient.get<{ status: string; timestamp: string }>(PUBLIC_ENDPOINTS.health);
  return response.data;
};

export const getTickers = async (): Promise<any[]> => {
  const response = await apiClient.get<any>(BACKEND_RUST_ENDPOINTS.public.tickers);
  return normalizeBackendTickers(response.data);
};

export const getTickerMap = async (): Promise<Record<string, any>> => {
  const response = await apiClient.get<any>(BACKEND_RUST_ENDPOINTS.public.tickers);
  return normalizeBackendTickerMap(response.data);
};

// React Query hooks for public data
export const usePublicMarkets = () => {
  return useQuery({
    queryKey: ['public', 'markets'],
    queryFn: getMarkets,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const usePublicCurrencies = () => {
  return useQuery({
    queryKey: ['public', 'currencies'],
    queryFn: getCurrencies,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

export const useTradingFees = () => {
  return useQuery({
    queryKey: ['public', 'trading-fees'],
    queryFn: getTradingFees,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useMemberLevels = () => {
  return useQuery({
    queryKey: ['public', 'member-levels'],
    queryFn: getMemberLevels,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useWithdrawLimits = () => {
  return useQuery({
    queryKey: ['public', 'withdraw-limits'],
    queryFn: getWithdrawLimits,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useServerTimestamp = () => {
  return useQuery({
    queryKey: ['public', 'timestamp'],
    queryFn: getTimestamp,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useServerVersion = () => {
  return useQuery({
    queryKey: ['public', 'version'],
    queryFn: getVersion,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useServerHealth = () => {
  return useQuery({
    queryKey: ['public', 'health'],
    queryFn: getHealth,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const usePublicTickers = () => {
  return useQuery({
    queryKey: ['public', 'tickers'],
    queryFn: getTickers,
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

// Backward compatibility export (Deprecated, try to use direct imports)
// Object export removed to prevent TDZ issues

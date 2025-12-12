// Export all API services with specific exports to avoid conflicts

// Public APIs (no authentication required)
export {
  usePublicMarkets,
  usePublicMarkets as useMarkets, // Alias for useMarkets
  usePublicCurrencies,
  usePublicTickers,
  usePublicTickers as useTickers, // Alias for useTickers
  useTradingFees,
  useMemberLevels,
  useWithdrawLimits,
  useServerTimestamp,
  useServerVersion,
  useServerHealth
} from './services/public';

// Trading APIs (authenticated)
export {
  useOrders,
  useOrder,
  useCreateOrder,
  useCancelOrder,
  useCancelAllOrders,
  useTrades,
  useTrade,
  useTicker,
  useOrderBook,
  useMarketTrades,
  useMarketTrades as usePublicMarketTrades, // Alias for public market trades
  useKline
} from './services/trading';

// Account APIs (authenticated)
export {
  useAccountBalances,
  useAccountBalance,
  useAccountDeposits,
  useAccountDeposit,
  useAccountWithdraws,
  useAccountWithdraw,
  useCreateWithdraw,
  useBeneficiaries,
  useBeneficiary,
  useCreateBeneficiary,
  useDeleteBeneficiary,
  useCreateDepositAddress,
  useAccountTransactions,
  useAccountTransaction,
  useAccountStats,
  useCreateInternalTransfer,
  useInternalTransfers,
  useInternalTransfer,
  useWallets
} from './services/account';

// Identity APIs (authentication)
export {
  useIdentityPing,
  useIdentityConfigs,
  useCreateSession,
  useDeleteSession,
  useCreateUser,
  useGenerateEmailCode,
  useGeneratePasswordCode,
  useConfirmPasswordCode
} from './services/identity';

// User Resource APIs (Orbisigner - authenticated)
export {
  useUserProfile,
  useUpdateProfile,
  useUserDocuments,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
  useUserPhones,
  useCreatePhone,
  useVerifyPhone,
  useDeletePhone,
  useEnableOtp,
  useDisableOtp,
  useVerifyOtp,
  useUserApiKeys,
  useCreateApiKey,
  useUpdateApiKey,
  useDeleteApiKey,
  useUserLabels,
  useCreateLabel,
  useUpdateLabel,
  useDeleteLabel,
  useUserDataStorage,
  useSetDataStorage
} from './services/user';

// Legacy exports for backward compatibility
export {
  useMarketOrders,
  useMarketOrder,
  useCreateOrder as useCreateMarketOrder,
  useCancelOrder as useCancelMarketOrder,
  useCancelAllOrders as useCancelAllMarketOrders,
  useMarketTrade
} from './services/market';

// WebSocket APIs
export { useMarketWebSocket } from './websocket';

// Export API client
// Export API client - Unified to use Axios client
export { api, ApiError as APIError } from './client';

// Legacy config exports - TODO: Refactor consumers to use @/lib/env directly
export { apiConfig, getApiBaseUrl, getAuthHeaders } from '../api-client/config';
export type { APIConfig } from '../api-client/config';
// Export all API services with specific exports to avoid conflicts
export { useMarkets, useMarketTicker, useOrderBook, useTrades } from './services/markets';
export { useWallets, useWallet, useCreateDeposit, useCreateWithdraw, useDepositAddress } from './services/wallets';
export { useOrders, useOrder, useCreateOrder, useCancelOrder } from './services/orders';
export { 
  useAccountBalances, 
  useAccountBalance, 
  useAccountDeposits, 
  useAccountDeposit,
  useCreateDeposit as useCreateAccountDeposit,
  useAccountWithdrawals,
  useAccountWithdrawal,
  useCreateWithdrawal,
  useBeneficiaries,
  useBeneficiary,
  useCreateBeneficiary,
  useUpdateBeneficiary,
  useDeleteBeneficiary,
  useDepositAddress as useAccountDepositAddress,
  useAccountHistory
} from './services/account';
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
export { useCreateLead } from './services/leads';
export { 
  useMarketOrders, 
  useMarketOrder, 
  useCreateOrder as useCreateMarketOrder,
  useCancelOrder as useCancelMarketOrder,
  useCancelAllOrders,
  useMarketTrades,
  useMarketTrade
} from './services/market';
export { 
  usePublicMarkets,
  usePublicMarket,
  usePublicCurrencies,
  usePublicCurrency,
  usePublicTickers,
  usePublicTicker,
  usePublicOrderBook,
  usePublicTrades,
  usePublicKLines,
  usePublicDepth,
  usePublicMemberLevels,
  usePublicFeeGroups,
  usePublicFees,
  usePublicTimestamp
} from './services/public';
export { 
  useUserProfile as useResourceUserProfile,
  useUpdateUserProfile as useUpdateResourceProfile,
  useApiKeys,
  useCreateApiKey,
  useUpdateApiKey,
  useDeleteApiKey,
  useLabels,
  useDocuments,
  useUploadDocument as useUploadResourceDocument,
  usePhones,
  useCreatePhone,
  useGenerateOtpQrCode,
  useEnableOtp,
  useUpdateProfile as useUpdateResourceProfileData,
  useChangePassword
} from './services/resource';
export { 
  useUserProfile,
  useUpdateUserProfile,
  useUploadDocument,
  useAddPhone,
  useAddLabel
} from './services/user';

// Export API client
export { api, APIError } from '../api-client';
export { apiConfig, getApiBaseUrl, getAuthHeaders } from '../api-client/config';

// Export types
export type { APIConfig } from '../api-client/config';

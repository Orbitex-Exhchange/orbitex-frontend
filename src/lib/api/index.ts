// Export all API services
export * from './client';
export * from './mock-data';
export * from './mock-data/enhanced';
export * from './services/identity';
export * from './services/resource';
export * from './services/leads';
export * from './services/account';
export * from './services/market';
export * from './services/public';

// Legacy exports for backward compatibility (renamed to avoid conflicts)
export { 
  useUserProfile as useLegacyUserProfile,
  useUpdateUserProfile as useLegacyUpdateUserProfile,
  useUploadDocument as useLegacyUploadDocument
} from './services/user';
export { 
  useMarkets as useLegacyMarkets,
  useMarketTicker as useLegacyMarketTicker,
  useOrderBook as useLegacyMarketOrderBook,
  useMarkets as useLegacyMarketTrades
} from './services/markets';
export { 
  useWallets as useLegacyWallets,
  useWallet as useLegacyWallet,
  useCreateDeposit as useLegacyCreateDeposit,
  useCreateWithdraw as useLegacyCreateWithdrawal
} from './services/wallets';
export { 
  useOrders as useLegacyOrders,
  useOrder as useLegacyOrder,
  useCreateOrder as useLegacyCreateOrder,
  useCancelOrder as useLegacyCancelOrder
} from './services/orders';

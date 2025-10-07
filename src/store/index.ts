// Export all stores
export * from './authStore';
export * from './walletStore';
export * from './marketStore';
export * from './tradingStore';
export * from './hftStore';

// Re-export commonly used hooks
export { useAuthStore, useUser, useIsAuthenticated, useAuthLoading, useAuthError } from './authStore';
export { useWalletStore, useBalances, useWalletLoading, useWalletError, walletActions } from './walletStore';
export { useMarketStore, useMarkets, useTickers, useMarketLoading, useMarketError, marketActions } from './marketStore';
export { useTradingStore, useOrderBookData, useRecentTrades, useOrderBookSettings, tradingActions } from './tradingStore';
export { useHFTStore, useMarketDepth, useRealTimeTrades, useVolumeProfile, usePriceVelocity, useMarketData, useHFTLoading, useHFTError, useSelectedMarket, hftActions } from './hftStore';
